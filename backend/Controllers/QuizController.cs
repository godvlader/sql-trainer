using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using a15.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using a15.Helpers;


namespace a15.Controllers;

// [Authorize]
[Route("api/quiz")]
[ApiController]
public class QuizController : ControllerBase
{
    private readonly PridContext _context;
    private readonly IMapper _mapper;
    private async Task<User?> GetLoggedUser() => await _context.Users.Where (u => u.Pseudo == User! .Identity !.Name).SingleOrDefaultAsync();

    /*
    Le contrôleur est instancié automatiquement par ASP.NET Core quand une requête HTTP est reçue.
    Le paramètre du constructeur recoit automatiquement, par injection de dépendance, 
    une instance du context EF (MsnContext).
    */
    public QuizController(PridContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }

    [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetAll()
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        try 
        {
           var quizzes = await _context.Quizzes
                    .Include(q => q.Database)
                    .Include(q => q.Questions) //include Questions entity
                        .ThenInclude(question => question.Solutions) //Answers entity within Questions
                    .Include(quiz => quiz.Attempts)
                        .ThenInclude(att => att.Answers)
                    .Select(q=>q)
                    .OrderBy(q => q.Name)
                    .ToListAsync();
            UpdateTeacherStatusForQuizzes(quizzes);

        var quizzesDTO = _mapper.Map<List<QuizDTO>>(quizzes);
        foreach (var quizDto in quizzesDTO)
        {
            Console.WriteLine($"Quiz: {quizDto.Name}, Status: {quizDto.Status}");
        }
        //foreach quiz if user has attemp => update
        return Ok(quizzesDTO);

        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, "Internal server error");
        }
    }

    private static void UpdateTeacherStatusForQuizzes(List<Quiz> quizzes)
    {
        DateTimeOffset today = DateTimeOffset.Now;

        foreach (var quiz in quizzes)
        {
            if (quiz.Finish.HasValue && quiz.Finish < today)
            {
                quiz.TeacherStatus = Statut.CLOTURE;
            }
            else
            {
                quiz.TeacherStatus = quiz.IsPublished ? Statut.PUBLIE : Statut.PAS_PUBLIE;
            }
        }
    }


    // [AllowAnonymous]
    // [HttpGet("prof/{profId}")]
    // public async Task<ActionResult<IEnumerable<QuizDTO>>> GetQuestionsByProf(int profId)
    // {
    
    //     var quizzes = await _context.Quizzes
    //                 .Where(q => q.TeacherId == profId)
    //                 .Include(q => q.Database)
    //                 .Include(q => q.Questions) // Include the Questions entity
    //                     .ThenInclude(question => question.Solutions) // Include the Answers entity within Questions
    //                 .Include(quiz => quiz.Attempts)
    //                     .ThenInclude(att => att.Answers)
    //                 .ToListAsync();

    //     // Now, you have loaded quizzes with their related Questions and Answers entities.
    //     return _mapper.Map<List<QuizDTO>>(quizzes);

    // }

    //differentiate tp from tests from all => no {}
    [Authorized(Role.Student, Role.Admin)]
    [HttpGet("tp/{userId}")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTPs(int userId)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }
        
         var quizzes = await _context.Quizzes
                        .Where(q => q.IsTest == false && q.IsPublished == true)
                        .Include(q => q.Database)
                        .Include(q => q.Questions) // Include the Questions entity
                            .ThenInclude(question => question.Solutions) // Include the Answers entity within Questions
                        .Include(quiz => quiz.Attempts)
                            .ThenInclude(att => att.Answers)
                        .OrderBy(q => q.Name)
                        .ToListAsync();
        await ModifyCurrentUserQuizState(quizzes, userId);
        // Now, you have loaded quizzes with their related Questions and Answers entities.
        return _mapper.Map<List<QuizDTO>>(quizzes);

    }

    [Authorized(Role.Student, Role.Admin)]
    [HttpGet("tests/{userId}")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTests(int userId)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }

        try
        {
            var quizzes = await _context.Quizzes
                        .Where(q => q.IsTest == true && q.IsPublished == true)
                        .Include(q => q.Database)
                        .Include(q => q.Questions) // Include the Questions entity
                            .ThenInclude(question => question.Solutions) // Include the Answers entity within Questions
                        .Include(quiz => quiz.Attempts)
                            .ThenInclude(att => att.Answers)
                        .OrderBy(q => q.Name)
                        .ToListAsync();
            await ModifyCurrentUserQuizState(quizzes, userId);

        return _mapper.Map<List<QuizDTO>>(quizzes);

        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            Console.WriteLine("=================================================================");
            Console.WriteLine($"Error: {ex.Message}\nStackTrace: {ex.StackTrace}");
            return StatusCode(500, "Internal server error");
        }
    }

    [Authorized(Role.Student, Role.Admin)]
    [HttpPost("attempt")]
    public async Task<ActionResult<AttemptDTO>> HandleAttempt([FromBody] AttemptRequestDTO attemptRequest)
    { 
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin))
        {
            return Forbid();
        }

        // Check if the Quiz exists
        var quiz = await _context.Quizzes
                                .Include(q => q.Attempts)
                                .FirstOrDefaultAsync(q => q.Id == attemptRequest.QuizId);
        if (quiz == null)
        {
            return NotFound($"Quiz with ID {attemptRequest.QuizId} not found.");
        }

        var studentId = attemptRequest.UserId;
        var attempt = quiz.Attempts
                        .Where(a => a.StudentId == studentId && a.Finish == null)
                        .OrderByDescending(a => a.Start)
                        .FirstOrDefault();

        if (attempt != null)
        {
            // Existing attempt found, return it
            return Ok(_mapper.Map<AttemptDTO>(attempt));
        }

        // No existing attempt found, create new one
        var newAttempt = new Attempt
        {
            QuizId = attemptRequest.QuizId,
            StudentId = studentId,
            Start = DateTimeOffset.UtcNow,
        };

        quiz.Attempts.Add(newAttempt);
        await _context.SaveChangesAsync();

        // Create a list with the single quiz and update its status
        var quizzes = new List<Quiz> { quiz };
        await ModifyCurrentUserQuizState(quizzes, studentId);

        return CreatedAtAction(nameof(GetAttempt), new { id = newAttempt.Id }, _mapper.Map<AttemptDTO>(newAttempt));
    }


    private async Task ModifyCurrentUserQuizState(List<Quiz> quizzes, int userId)
    {
        DateTimeOffset today = DateTimeOffset.Now;

        foreach (var quiz in quizzes)
        {
            if (quiz.Finish.HasValue && quiz.Finish < today)
            {
                quiz.Status = Statut.CLOTURE;
                quiz.IsClosed = true;
                continue;
            }

            var latestAttempt = await _context.Attempts
                .Where(a => a.QuizId == quiz.Id && a.StudentId == userId)
                .OrderByDescending(a => a.Start)
                .FirstOrDefaultAsync();

            if (latestAttempt == null)
            {
                quiz.Status = Statut.PAS_COMMENCE;
            }
            else if (latestAttempt.Finish == null)
            {
                quiz.Status = Statut.EN_COURS;
            }
            else
            {
                quiz.Status = Statut.FINI;
                if (quiz.IsTest)
                {
                    quiz.Note = await CalculateQuizNote(quiz, latestAttempt);
                }
            }
        }
    }

    private async Task<int> CalculateQuizNote(Quiz quiz, Attempt attempt)
    {
        // Get the total number of questions in the quiz
        var totalQuestions = await _context.Questions.CountAsync(q => q.QuizId == quiz.Id);

        // Get the last answer for each question in the latest attempt
        var lastAnswers = _context.Answers
            .Where(a => a.AttemptId == attempt.Id)
            .GroupBy(a => a.QuestionId)
            .Select(g => g.OrderByDescending(a => a.Timestamp).FirstOrDefault())
            .ToList();

        // Count how many of these last answers are correct
        var correctAnswersCount = lastAnswers.Count(a => a != null && a.IsCorrect);

        // Calculate the score
        return totalQuestions > 0 ? correctAnswersCount * 10 / totalQuestions : 0;
    }

    [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    [HttpGet("quizinfo/{Id}")]
    public async Task<ActionResult<QuizDTO>> GetQuizInfoById(int Id) 
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }
        var quiz = await _context.Quizzes
            .Where(q => q.Id == Id)
            .Include(q => q.Database)
            .Include(q => q.Questions)
                .ThenInclude(question => question.Solutions)
            .Include(q => q.Questions)
                .ThenInclude(question => question.Answers)
                .ThenInclude(answer => answer.Attempt)
            .FirstOrDefaultAsync();

        if (quiz == null)
        {
            return NotFound("Quiz not found for the given question ID.");
        }

        // Manually order the questions
        quiz.Questions = quiz.Questions.OrderBy(q => q.Order).ToList();

        // Map the ordered quiz to DTO
        var quizDTO = _mapper.Map<QuizDTO>(quiz);
        return Ok(quizDTO);
    }

    [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    [HttpGet("{Id}")]
    public async Task<ActionResult<Quiz>> GetById(int Id) 
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }
        var quiz = await _context.Quizzes
                            .Where(q => q.Id == Id)
                            .Select(q => q.Name)
                            .FirstOrDefaultAsync();

        if (quiz == null)
        {
            return NotFound("Quiz not found for the given question ID.");
        }

        return Ok(quiz);
    }

    // fix this
    [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    [HttpGet("checkIfAttempt")]
    public async Task<ActionResult<bool>> CheckIfAnyAttemptExists(int quizId) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        var anyAttemptExists = await _context.Attempts
                                     .AnyAsync(a => a.QuizId == quizId);

        return Ok(anyAttemptExists);
    }

    [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    [HttpGet("checkAttempt")]
    public async Task<ActionResult<AttemptDTO>> CheckAttempt(int quizId, int userId) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        var attempt = await _context.Attempts
                                    .Where(a => a.QuizId == quizId && a.StudentId == userId)
                                    .OrderByDescending(a => a.Start)
                                    .FirstOrDefaultAsync();

        if (attempt == null) {
            return NotFound("No existing attempt found.");
        } else {
            var attemptDTO = _mapper.Map<AttemptDTO>(attempt);
            // Add a property to indicate if the attempt is finished
            attemptDTO.IsFinished = attempt.Finish.HasValue;
            return Ok(attemptDTO);
        }
    }

    
    // [HttpPut]
    // public async Task UpdateHasAttemptProperty(int quizId, int userId)
    // {
    //     var quiz = await _context.Quizzes.FindAsync(quizId);
    //     if (quiz != null)
    //     {
    //         var hasAttempt = await _context.Attempts.AnyAsync(a => a.QuizId == quiz.Id && a.StudentId == userId);
    //         quiz.HasAttempt = true;
    //     }
    // }

    // [Authorized(Role.Student, Role.Admin)]
    // [HttpGet("continueAttempt")]
    // public async Task<ActionResult<QuestionDTO>> ContinueAttempt(int quizId, int studentId) {
    //     // Fetch the most recent attempt for the student that isn't finished
    //     var attempt = await _context.Attempts
    //         .Where(a => a.QuizId == quizId && a.StudentId == studentId && a.Finish == null)
    //         .OrderByDescending(a => a.Start)
    //         .FirstOrDefaultAsync();

    //     if (attempt == null) {
    //         return NotFound("No ongoing attempt found.");
    //     }

    //     // Fetch the first question of the quiz
    //     var firstQuestion = await _context.Questions
    //         .Where(q => q.QuizId == quizId)
    //         .OrderBy(q => q.Order)
    //         .Select(q => new QuestionDTO {
    //             Id = q.Id,
    //             Order = q.Order,
    //             Body = q.Body,
    //             QuizId = q.QuizId
    //         })
    //         .FirstOrDefaultAsync();

    //     if (firstQuestion == null) {
    //         return NotFound("No questions found for the quiz.");
    //     }

    //     return Ok(firstQuestion);
    // }

    // [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    // [HttpPost("createAttempt")]
    // public async Task<ActionResult<AttemptDTO>> CreateNewAttempt([FromQuery] int quizId, [FromQuery] int studentId)
    // {
    //     var newAttempt = new Attempt
    //     {
    //         QuizId = quizId,
    //         StudentId = studentId,
    //         Start = DateTimeOffset.UtcNow,
    //     };

    //     _context.Attempts.Add(newAttempt);
    //     await _context.SaveChangesAsync();

    //     // map Attempt to AttemptDTO
    //     var attemptDto = new AttemptDTO
    //     {
    //         Id = newAttempt.Id,
    //         // other properties
    //     };

    //     return CreatedAtAction(nameof(GetAttempt), new { id = newAttempt.Id }, newAttempt);
    // }

    [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    [HttpGet("{id}")]
    public async Task<ActionResult<AttemptDTO>> GetAttempt(int id)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        var attempt = await _context.Attempts
                                    .Include(a => a.Quiz)
                                    .Include(a => a.Student) 
                                    .FirstOrDefaultAsync(a => a.Id == id);

        if (attempt == null)
        {
            return NotFound($"Attempt with ID {id} not found.");
        }

        // Map the Attempt entity to AttemptDTO
        var attemptDto = new AttemptDTO
        {
            Id = attempt.Id,
            // Map other properties as necessary
            // For example:
            QuizId = attempt.QuizId,
            StudentId = attempt.StudentId,
            Start = attempt.Start,
            // etc.
        };

        return Ok(attemptDto);
    }

    [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    [HttpGet("getDatabases")]
    public async Task<ActionResult<List<DatabaseDTO>>> GetDatabases()
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        var dbs = await _context.Databases.ToListAsync();
        var dbDTOs = _mapper.Map<List<DatabaseDTO>>(dbs); // Assuming DatabaseDTO is your DTO class
        return Ok(dbDTOs);

    }


    [Authorized(Role.Admin, Role.Teacher)]
    [HttpGet("quizname-available/{quizName}/{quizId?}")]
    public async Task<ActionResult<bool>> IsQuizNameAvailable(string quizName, int? quizId)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        var isAvailable = quizId == null
            ? await _context.Quizzes.AllAsync(u => u.Name != quizName)
            : await _context.Quizzes.AllAsync(u => u.Name != quizName || u.Id == quizId);
        return Ok(isAvailable);
    }

    [Authorized(Role.Student, Role.Admin, Role.Teacher)]
    [HttpGet("getAttemptByUser/{userId}/{quizId}/{questionId}")]
    public async Task<ActionResult<AttemptDTO>> GetAttemptByUserId(int userId, int quizId, int questionId)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Student && loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        // Retrieve the latest attempt for the specific quiz and question
        var latestAttempt = await _context.Attempts
            .Where(a => a.QuizId == quizId && a.StudentId == userId)
            .OrderByDescending(a => a.Start)
            .Include(a => a.Answers)
            .FirstOrDefaultAsync();

        if (latestAttempt == null)
        {
            return NotFound("No attempts found for the given user and quiz.");
        }

        // Filter answers for the specific question
        latestAttempt.Answers = latestAttempt.Answers
            .Where(answer => answer.QuestionId == questionId)
            .OrderByDescending(answer => answer.Timestamp)
            .ToList();

        var attemptDTO = _mapper.Map<AttemptDTO>(latestAttempt);
        return Ok(attemptDTO);
    }


    [Authorized(Role.Admin, Role.Teacher)]
    [HttpPost("postquiz")]
    public async Task<ActionResult<QuizDTO>> PostQuiz([FromBody] NewQuizDTO newQuizDTO)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        if (newQuizDTO == null)
        {
            return BadRequest("Quiz data is required.");
        }

        try
        {
            var newQuiz = _mapper.Map<Quiz>(newQuizDTO);
            var validationResult = await new QuizValidator(_context).ValidateOnCreate(newQuiz);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .Select(e => new { e.PropertyName, e.ErrorMessage })
                    .ToList();
                return BadRequest(new { Errors = errors });
            }

            _context.Quizzes.Add(newQuiz);
            await _context.SaveChangesAsync();

            int quizId = newQuiz.Id;

            if (newQuizDTO.Questions != null)
            {
                foreach (var questionDTO in newQuizDTO.Questions)
                {
                    // Check if question already exists
                    var existingQuestion = await _context.Questions
                        .FirstOrDefaultAsync(q => q.Body == questionDTO.Body && q.QuizId == quizId);

                    if (existingQuestion == null)
                    {
                        var question = _mapper.Map<Question>(questionDTO);
                        question.QuizId = quizId;
                        _context.Questions.Add(question);

                        if (questionDTO.Solutions != null)
                        {
                            foreach (var solutionDTO in questionDTO.Solutions)
                            {
                                //check if solution already exists
                                var existingSolution = await _context.Solutions
                                    .FirstOrDefaultAsync(s => s.Sql == solutionDTO.Sql && s.QuestionId == question.Id);

                                if (existingSolution == null)
                                {
                                    var solution = _mapper.Map<Solution>(solutionDTO);
                                    solution.QuestionId = question.Id;
                                    _context.Solutions.Add(solution);
                                }
                            }
                        }
                    }
                }
                await _context.SaveChangesAsync();
            }

            var quizDTO = _mapper.Map<QuizDTO>(newQuiz);
            return CreatedAtAction(nameof(GetQuizInfoById), new { id = newQuiz.Id }, quizDTO);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Internal Server Error: " + ex.Message);
        }
    }


    private async Task<Question> PostQuestion(QuestionDTO questionDTO, int quizId)
    {
        var question = _mapper.Map<Question>(questionDTO);
        question.QuizId = quizId;
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();

        if (questionDTO.Solutions != null)
        {
            foreach (var solutionDTO in questionDTO.Solutions)
            {
                var solution = _mapper.Map<Solution>(solutionDTO);
                solution.QuestionId = question.Id;
                _context.Solutions.Add(solution);
            }
            await _context.SaveChangesAsync();
        }

        return question;
    }

    [Authorized(Role.Admin, Role.Teacher)]
    [HttpPut("updatequiz/{quizId}")]
    public async Task<ActionResult<QuizDTO>> UpdateQuiz(int quizId, [FromBody] NewQuizDTO quizDTO)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        if (quizDTO == null)
        {
            return BadRequest("Quiz data is required.");
        }

        var existingQuiz = await _context.Quizzes
                                        .Include(q => q.Questions)
                                            .ThenInclude(q => q.Solutions)
                                        .FirstOrDefaultAsync(q => q.Id == quizId);

        if (existingQuiz == null)
        {
            return NotFound($"Quiz with ID {quizId} not found.");
        }

        try
        {
            //update Quiz properties
            existingQuiz.Name = quizDTO.Name;
            existingQuiz.Description = quizDTO.Description;
            existingQuiz.IsPublished = quizDTO.IsPublished;
            existingQuiz.IsTest = quizDTO.IsTest;
            existingQuiz.Start = quizDTO.Start;
            existingQuiz.Finish = quizDTO.Finish;
            existingQuiz.DatabaseId = quizDTO.DatabaseId;
            existingQuiz.TeacherId = quizDTO.TeacherId;

            //remove existing questions
            _context.Questions.RemoveRange(existingQuiz.Questions);

            //add new questions and solutions
            var newQuestions = quizDTO.Questions.Select(questionDTO => 
            {
                var question = _mapper.Map<Question>(questionDTO);
                question.QuizId = quizId;
                question.Solutions = questionDTO.Solutions.Select(solutionDTO => 
                    _mapper.Map<Solution>(solutionDTO)).ToList();
                return question;
            }).ToList();

            //assign the new questions to the quiz
            existingQuiz.Questions = newQuestions;

            await _context.SaveChangesAsync();

            var updatedQuizDTO = _mapper.Map<QuizDTO>(existingQuiz);
            return Ok(updatedQuizDTO);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Internal Server Error: " + ex.Message);
        }
    }

    [Authorized(Role.Admin, Role.Teacher)]
    [HttpDelete("{quizId}")]
    public async Task<IActionResult> DeleteQuiz(int quizId)
    {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }
        var quizToDelete = await _context.Quizzes.FindAsync(quizId);
        if (quizToDelete == null)
        {
            return NotFound($"Quiz with ID {quizId} not found.");
        }

        _context.Quizzes.Remove(quizToDelete);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Quiz deleted successfully." });
    }

}