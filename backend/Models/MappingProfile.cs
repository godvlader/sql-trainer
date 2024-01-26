using AutoMapper;

namespace a15.Models;

/*
Cette classe sert à configurer AutoMapper pour lui indiquer quels sont les mappings possibles
et, le cas échéant, paramétrer ces mappings de manière déclarative (nous verrons des exemples plus tard).
*/
public class MappingProfile : Profile
{
    private PridContext _context;

    /*
    Le gestionnaire de dépendance injecte une instance du contexte EF dont le mapper peut
    se servir en cas de besoin (ce n'est pas encore le cas).
    */
    public MappingProfile(PridContext context) 
    {
        _context = context;

        // Mapping from User to UserDTO and vice versa
        CreateMap<User, UserDTO>();
        CreateMap<UserDTO, User>();

        // Mapping from UserDTO to UserWithPasswordDTO and vice versa
        CreateMap<User, UserWithPasswordDTO>(); 
        CreateMap<UserWithPasswordDTO, User>();

        //Mapping from User to UserLogin
        CreateMap<User, UserLoginDTO>();
        CreateMap<UserLoginDTO, User>();

        CreateMap<User, UserSignupDTO>();
        CreateMap<UserSignupDTO, User>();

        CreateMap<User, UserUpdateDTO>();
        CreateMap<UserUpdateDTO, User>();

        CreateMap<Quiz, QuizDTO>()
            .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.Questions));
        CreateMap<QuizDTO, Quiz>();

        CreateMap<Quiz, NewQuizDTO>();
        CreateMap<NewQuizDTO, Quiz>();

        CreateMap<QuestionDTO, Question>()
            .ForMember(dest => dest.Body, opt => opt.MapFrom(src => src.Body));
        CreateMap<Question, QuestionDTO>()
            .ForMember(dest => dest.QuizName, opt => opt.MapFrom(src => src.Quiz.Name))
            .ForMember(dest => dest.QuizDbName, opt => opt.MapFrom(src => src.Quiz.Database.Name))
            .ForMember(dest => dest.Database, opt => opt.MapFrom(src => src.Quiz.Database))
            .ForMember(dest => dest.IsTest, opt => opt.MapFrom(src => src.Quiz.IsTest));
                // This AutoMapper configuration maps the Name property of the Quiz navigation 
                // property in the Question entity to the QuizName property in the QuestionDTO object.

                // In this configuration, CreateMap<Question, QuestionDTO>() specifies the mapping from 
                // Question to QuestionDTO. The ForMember method allows you to specify custom member mapping. 
                // dest => dest.QuizName refers to the QuizName property in the destination (QuestionDTO), and 
                // opt.MapFrom(src => src.Quiz.Name) maps it from the Name property of the source (Question).
                //https://stackoverflow.com/questions/6985000/how-to-use-automapper-formember
        CreateMap<Answer, AnswerDTO>();
        CreateMap<AnswerDTO, Answer>();

        CreateMap<Solution, SolutionDTO>();
        CreateMap<SolutionDTO, Solution>();

        CreateMap<Attempt, AttemptDTO>()
            .ForMember(dest => dest.IsFinished, opt => opt.MapFrom(src => src.Finish.HasValue));

        CreateMap<AttemptDTO, Attempt>();

        CreateMap<Database, DatabaseDTO>();
        CreateMap<DatabaseDTO, Database>();
        

    }

}
