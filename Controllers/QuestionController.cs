using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using a15.Models;
using AutoMapper;
using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Authorization;
using a15.Helpers;
using System.Data;
using prid_2324_a15.Models;
using System.Diagnostics;


namespace a15.Controllers;

// [Authorize]
[Route("api/question")]
[ApiController]
public class QuestionController : ControllerBase{
    private readonly PridContext _context;
    private readonly IMapper _mapper;
    private async Task<User?> GetLoggedUser() => await _context.Users.Where (u => u.Pseudo == User! .Identity !.Name).SingleOrDefaultAsync();

    /*
Le contrôleur est instancié automatiquement par ASP.NET Core quand une requête HTTP est reçue.
Le paramètre du constructeur recoit automatiquement, par injection de dépendance, 
une instance du context EF (MsnContext).
*/
    public QuestionController(PridContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }

    [Authorized(Role.Student, Role.Admin)]
    [HttpGet("{questionId}")]
    public async Task<ActionResult<QuestionDTO>> GetQuestionsById(int questionId)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }

        Console.WriteLine("==========================================================");
        var question = await _context.Questions
            .Include(q => q.Quiz)
                .ThenInclude(q => q.Database)
            .Include(q => q.Solutions.OrderBy(s => s.Order)) // Order solutions
            .Include(bob => bob.Answers)
            .FirstOrDefaultAsync(q => q.Id == questionId);

        if (question == null)
            return NotFound();

        var questionDTO = _mapper.Map<QuestionDTO>(question);
        // Include order in DTO if necessary
        questionDTO.Order = question.Order; 
        Console.WriteLine(questionDTO);
        return questionDTO; 
    }


    // [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    // [HttpGet("questions/{quizId}")]
    // public async Task<ActionResult<List<Question>>> GetQuestionsForQuiz(int quizId)
    // {
    //     var questions = await _context.Questions
    //             .Where(q => q.QuizId == quizId)
    //             .OrderBy(q => q.Order)
    //             .ToListAsync();

    //     if (questionIds == null || !questionIds.Any())
    //     {
    //         return NotFound();
    //     }

    //     return questionIds;
    // }


    [Authorized(Role.Student, Role.Admin)]
    [HttpGet("ids/{quizId}")]
    public async Task<ActionResult<List<int>>> GetQuestionIdsForQuiz(int quizId)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }
        var questionIds = await _context.Questions
                .Where(q => q.QuizId == quizId)
                .OrderBy(q => q.Order)
                .Select(q => q.Id)
                .ToListAsync();

        if (questionIds == null || !questionIds.Any())
        {
            return NotFound();
        }

        return questionIds;
    }

    [Authorized(Role.Student, Role.Admin)]
    [HttpPost("send")]
    public async Task<ActionResult<object>> Send([FromBody] SqlDTO sqlDTO)
    {   
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }
        Console.WriteLine("entered send back ===============================");
        // Correct solution
        string solution = await _context.Solutions
            .Where(s => s.QuestionId == sqlDTO.QuestionId)
            .Select(s => s.Sql)
            .FirstOrDefaultAsync() ?? string.Empty;

        if (string.IsNullOrEmpty(solution))
            return NotFound("Solution not found.");

        // User query
SqlDisplayDTO userQueryResult;
Stopwatch userQueryStopwatch = Stopwatch.StartNew();
userQueryResult = sqlDTO.ExecuteQuery();
userQueryStopwatch.Stop();

// Execute correct query
SqlDTO correctQueryDto = new SqlDTO { Sql = solution, DatabaseName = sqlDTO.DatabaseName };
SqlDisplayDTO correctQueryResult;
Stopwatch correctQueryStopwatch = Stopwatch.StartNew();
correctQueryResult = correctQueryDto.ExecuteQuery();
correctQueryStopwatch.Stop();

// Now you have the execution times in milliseconds
double userQueryExecutionTime = userQueryStopwatch.ElapsedMilliseconds; // Execution time of the user's query
double correctQueryExecutionTime = correctQueryStopwatch.ElapsedMilliseconds; // Execution time of the correct query

        // Check if user's response is correct
        bool isCorrect = userQueryResult.Error.Length == 0 && userQueryResult.CheckQueries(correctQueryResult).Error.Length == 0;

        int? currentAttemptId = await GetCurrentAttemptId(sqlDTO.UserId);
        if (currentAttemptId == null)
        {
            return NotFound("Current attempt not found.");
        }
        
        if(sqlDTO.SaveToDatabase){
            await SaveAnswer(new AnswerDTO
            {
                QuestionId = sqlDTO.QuestionId,
                AttemptId = currentAttemptId.Value,
                Sql = sqlDTO.Sql,
                IsCorrect = isCorrect,
                Timestamp = DateTimeOffset.UtcNow
            });
        }
        

        // Result of the user's query
        return userQueryResult;
    }
    private async Task<int?> GetCurrentAttemptId(int userId)
    {
        //try to find an ongoing attempt
        var currentAttempt = await _context.Attempts
            .Where(a => a.StudentId == userId && a.Finish == null)
            .OrderByDescending(a => a.Start)
            .FirstOrDefaultAsync();

        //no ongoing attempt, find the most recent attempt
        if (currentAttempt == null)
        {
            currentAttempt = await _context.Attempts
                .Where(a => a.StudentId == userId)
                .OrderByDescending(a => a.Start)
                .FirstOrDefaultAsync();
        }

        return currentAttempt?.Id;
    }

    [Authorized(Role.Student, Role.Admin)]
    [HttpPost("save-answer")]
    public async Task<ActionResult<string>> SaveAnswer(AnswerDTO answerDTO)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }

        try
        {
            // Try to find an existing attempt
            var attempt = await _context.Attempts.FirstOrDefaultAsync(a => a.Id == answerDTO.AttemptId);

            if (attempt == null)
            {
                return NotFound($"Attempt with ID {answerDTO.AttemptId} not found.");
            }

            var answer = new Answer
            {
                QuestionId = answerDTO.QuestionId,
                AttemptId = attempt.Id,  // Use the existing attempt ID
                Sql = answerDTO.Sql,
                IsCorrect = answerDTO.IsCorrect,
                Timestamp = answerDTO.Timestamp
            };

            // Save answer to the database
            _context.Answers.Add(answer);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Answer saved successfully." });
        }
        catch (Exception e)
        {
            return BadRequest($"Error saving answer: {e.Message}");
        }
    }

    [Authorized(Role.Student, Role.Admin)]
    [HttpPost("finish-attempt")]
    public async Task<ActionResult<object>> FinishAttempt([FromBody] FinishAttemptDTO request)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }
        
        var attempt = await _context.Attempts.FirstOrDefaultAsync(a => a.Id == request.AttemptId);

        if (attempt == null)
        {
            return NotFound($"Attempt with ID {request.AttemptId} not found.");
        }
        //Add finish date to mark it as finished
        attempt.Finish = DateTimeOffset.Now;
        
        // _context.Attempts.Update(attempt);
        await _context.SaveChangesAsync();
        

        return _mapper.Map<AttemptDTO>(attempt);
    }

    [Authorized(Role.Student, Role.Admin)]
    [HttpGet("GetReadOnly/{quizId}")]
    public async Task<ActionResult<Question>> GetReadOnly(int quizId)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }

        var question = await _context.Questions.FirstOrDefaultAsync(q => q.QuizId == quizId);

        if (question == null)
        {
            return NotFound($"No questions found for quiz ID {quizId}.");
        }

        return Ok(question);
    }


    // [HttpGet("check-if-answer/{questionId}/{attemptId}")]
    // public async Task<ActionResult<bool>> CheckIfQuestionAnswered(int questionId, int attemptId)
    // {
    //     var isAnswered = await _context.Answers.AnyAsync(a => a.QuestionId == questionId && a.AttemptId == attemptId);
    //     return Ok(isAnswered);
    // }

    // [HttpGet("get-answer/{questionId}/{attemptId}")]
    // public async Task<ActionResult<AnswerDTO>> GetAnswerForQuestion(int questionId, int attemptId)
    // {
    //     var answer = await _context.Answers
    //                             .FirstOrDefaultAsync(a => a.QuestionId == questionId && a.AttemptId == attemptId);

    //     if (answer != null)
    //     {
    //         // Map the Answer entity to AnswerDTO
    //         var answerDto = new AnswerDTO
    //         {
    //             Id = answer.Id,
    //             Sql = answer.Sql,
    //             // Timestamp = answer.Timestamp,
    //             IsCorrect = answer.IsCorrect,
    //             QuestionId = answer.QuestionId,
    //             // AttemptId = answer.AttemptId,
    //             // Map other properties if needed
    //         };

    //         return Ok(answerDto);
    //     }
    //     else
    //     {
    //         return NotFound("Answer not found.");
    //     }
    // }

    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getdata/{dbname}")]
    public async Task<ActionResult<Dictionary<string, List<string>>>> GetData(string dbname)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Teacher && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }

        string connectionString = $"server=localhost;database={dbname};uid=root;password=";
        var tableData = new Dictionary<string, List<string>>();

        using var connection = new MySqlConnection(connectionString);
        await connection.OpenAsync();

        // Directly await the GetSchema call without wrapping in Task.Run
        DataTable schema = await connection.GetSchemaAsync("Tables");

        foreach (DataRow row in schema.Rows)
        {
            string? tableName = row["TABLE_NAME"]?.ToString();
            if (!string.IsNullOrEmpty(tableName))
            {
                tableData.Add(tableName, new List<string>());
            }
        }

        Console.WriteLine("Returning data from GetData");
        return Ok(tableData);
    }

    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("GetAllColumnNames/{dbName}")]
    public async Task<ActionResult<Dictionary<string, List<string>>>> GetAllColumnNames(string dbName)
        {
            var loggedUser = await GetLoggedUser();
            if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Teacher && loggedUser.Role != Role.Admin))
            {
                return Forbid();
            }

        string connectionString = $"server=localhost;database={dbName};uid=root;password=";
        var columnData = new Dictionary<string, List<string>>();

        using var connection = new MySqlConnection(connectionString);
        await connection.OpenAsync();

        // Directly await the GetSchema call without wrapping in Task.Run
        DataTable schema = await connection.GetSchemaAsync("Columns");

        foreach (DataRow row in schema.Rows)
        {
            string? tableName = row["TABLE_NAME"]?.ToString();
            string? columnName = row["COLUMN_NAME"]?.ToString();

            if (tableName != null && columnName != null)
            {
                // Add the columnName to the list for the corresponding tableName
                if (!columnData.ContainsKey(tableName))
                {
                    columnData[tableName] = new List<string>();
                }
                columnData[tableName].Add(columnName);
            }
        }

        Console.WriteLine("Returning column data");
        return Ok(columnData);
    }

}