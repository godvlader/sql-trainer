using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using a15.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using BCrypt.Net;
using a15.Helpers;
using Microsoft.AspNetCore.Http.HttpResults;
using prid_tuto.Helpers;

namespace a15.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly PridContext _context;
    private readonly IMapper _mapper;

    private readonly TokenHelper _tokenHelper;
    /*
    Le contrôleur est instancié automatiquement par ASP.NET Core quand une requête HTTP est reçue.
    Le paramètre du constructeur recoit automatiquement, par injection de dépendance, 
    une instance du context EF (MsnContext).
    */
    public UsersController(PridContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
        _tokenHelper = new TokenHelper(context);
    }

    private async Task<User?> GetLoggedUser() => await _context.Users.Where (u => u.Pseudo == User! .Identity !.Name).SingleOrDefaultAsync();


    [AllowAnonymous]
    [HttpPost("authenticate")]
    public async Task<ActionResult<UserDTO>> Authenticate(UserLoginDTO dto) {
        var user = await Authenticate(dto.PseudoLogin, dto.PasswordLogin);
       
        var result = await new UserValidator(_context).ValidateForAuthenticate(user);
        if (!result.IsValid)
            return BadRequest(result);

        return Ok(_mapper.Map<UserDTO>(user));
    }

     private async Task<User?> Authenticate(string pseudo, string password) {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Pseudo == pseudo);

        // return null if member not found
        if (user == null)
            return null;

        var hash = TokenHelper.GetPasswordHash(password);
        if (user.Password == hash) {
            // authentication successful so generate jwt token
            user.Token = TokenHelper.GenerateJwtToken(user.Pseudo, user.Role);
            // Génère un refresh token et le stocke dans la table Members
            var refreshToken = TokenHelper.GenerateRefreshToken();
            await _tokenHelper.SaveRefreshTokenAsync(pseudo, refreshToken);
        }
        else
        {
            BadRequest("Incorrect password");
        }
        return user;
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokensDTO>> Refresh([FromBody] TokensDTO tokens) {
        var principal = TokenHelper.GetPrincipalFromExpiredToken(tokens.Token);
        var pseudo = principal.Identity?.Name!;
        var savedRefreshToken = await _tokenHelper.GetRefreshTokenAsync(pseudo);
        if (savedRefreshToken != tokens.RefreshToken)
            throw new SecurityTokenException("Invalid refresh token");

        var newToken = TokenHelper.GenerateJwtToken(principal.Claims);
        var newRefreshToken = TokenHelper.GenerateRefreshToken();
        await _tokenHelper.SaveRefreshTokenAsync(pseudo, newRefreshToken);

        return new TokensDTO {
            Token = newToken,
            RefreshToken = newRefreshToken
        };
    }

    [AllowAnonymous]
    [HttpPost("signup")]
    public async Task<ActionResult<UserDTO>> Signup(UserWithPasswordDTO data)
    {
       return await PostUser(data);
        
    }
   
    // GET: api/Users
    [Authorized(Role.Admin, Role.Teacher)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetAll() {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }
        /*
        Remarque: La ligne suivante ne marche pas :
            return _mapper.Map<IEnumerable<MemberDTO>>(await _context.Users.ToListAsync());
        En effet :
            C# doesn't support implicit cast operators on interfaces. Consequently, conversion of the interface to a concrete type is necessary to use ActionResult<T>.
            See: https://docs.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-5.0#actionresultt-type
        */
        // Récupère une liste de tous les membres et utilise le mapper pour les transformer en leur DTO
        return _mapper.Map<List<UserDTO>>(await _context.Users.ToListAsync());
    }

    [Authorized(Role.Admin, Role.Teacher)]
    [HttpGet("{Id}")]
    public async Task<ActionResult<UserDTO>> GetById(int Id) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        var user = await _context.Users.FindAsync(Id);
        if (user == null)
            return NotFound();
        return _mapper.Map<UserDTO>(user);
    }

    [Authorized(Role.Admin, Role.Teacher)]
    [HttpPost("postuser")]
    public async Task<ActionResult<UserDTO>> PostUser(UserWithPasswordDTO user) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        Console.WriteLine("PWD: " + user.Password);
        // Utilise le mapper pour convertir le DTO qu'on a reçu en une instance de Member
        var newMember = _mapper.Map<User>(user);
        // Valide les données
        Console.WriteLine("PWD: " + newMember.Password);
        var result = await new UserValidator(_context).ValidateOnCreate(newMember);
        
        Console.WriteLine("PWD HASHHHHH: " + newMember.Password);
        if (!result.IsValid)
            return BadRequest(result);

        newMember.Password = TokenHelper.GetPasswordHash(newMember.Password);
        // Ajoute ce nouveau membre au contexte EF
        _context.Users.Add(newMember);
        // Sauve les changements
        await _context.SaveChangesAsync();

        // Renvoie une réponse ayant dans son body les données du nouveau membre (3ème paramètre)
        // et ayant dans ses headers une entrée 'Location' qui contient l'url associé à GetOne avec la bonne valeur 
        // pour le paramètre 'pseudo' de bcet url.
        return CreatedAtAction(nameof(ByPseudo), new { pseudo = user.Pseudo }, _mapper.Map<UserDTO>(newMember));
    }

    [Authorized(Role.Admin, Role.Teacher)]
    [HttpPut]
    public async Task<IActionResult> PutUser(UserUpdateDTO dto) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        var user = await _context.Users.FindAsync(dto.Id);
        if (user == null) {
            return NotFound();
        }

        // Only update the password if a new one is provided
        if (!string.IsNullOrEmpty(dto.PasswordUpdate)) {
            user.Password = HashPassword(dto.PasswordUpdate);
        }

        if (dto.RoleUpdate.HasValue) {
            user.Role = dto.RoleUpdate.Value;
        }
    

        // Map other properties
        user.Pseudo = dto.PseudoUpdate ?? user.Pseudo;
        user.Email = dto.EmailUpdate ?? user.Email;
        user.FullName = dto.FullNameUpdate ?? user.FullName;
        user.BirthDate = dto.BirthDateUpdate ?? user.BirthDate;

        // Validate and save changes
        var result = await new UserValidator(_context).ValidateAsync(user);
        if (!result.IsValid) {
            return BadRequest(result);
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }


    [Authorized(Role.Admin, Role.Teacher)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        // Récupère en BD le membre à supprimer
        var user = await _context.Users.FindAsync(id);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Indique au contexte EF qu'il faut supprimer ce membre
        _context.Users.Remove(user);
        // Sauve les changements
        await _context.SaveChangesAsync();
        // Retourne un statut 204 avec une réponse vide
        return NoContent();
    }

    [Authorized(Role.Admin, Role.Teacher)]
    [HttpDelete("delete/{pseudo}")]
    public async Task<IActionResult> Delete(string pseudo) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        // Récupère en BD le membre à supprimer
        Console.WriteLine($"Received DELETE request for pseudo: {pseudo}");
       var userToDelete = await _context.Users.FirstAsync(u=>u.Pseudo == pseudo);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (userToDelete == null)
            return NotFound();
        // Indique au contexte EF qu'il faut supprimer ce membre
        _context.Users.Remove(userToDelete);
        // Sauve les changements
        await _context.SaveChangesAsync();
        // Retourne un statut 204 avec une réponse vide
        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("pseudo-available/{pseudo}")]
    public async Task<ActionResult<bool>> IsPseudoAvailable(string pseudo)
    {
        var isAvailable = await _context.Users.AllAsync(u => u.Pseudo != pseudo);
        return Ok(isAvailable);
    }

    [AllowAnonymous]
    [HttpGet("email-available/{email}")]
    public async Task<ActionResult<bool>> IsEmailAvailable(string email)
    {
        var isAvailable = await _context.Users.AllAsync(u => u.Email != email);
        return Ok(isAvailable);
    }


    
    //GET api/Users/byPseudo/{pseudo}
    [Authorized(Role.Admin, Role.Teacher)]
    [HttpGet("byPseudo/{pseudo}")]
    public async Task<ActionResult<UserDTO>> ByPseudo(string pseudo) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Pseudo == pseudo);
        if (user == null)
            return NotFound();
        return _mapper.Map<UserDTO>(user);
    }

    //GET api/Users/byEmail/{email}
    [Authorized(Role.Admin, Role.Teacher)]
    [HttpGet("byEmail/{email}")]
    public async Task<ActionResult<UserDTO>> ByEmail(string email) {
        var loggedUser = await GetLoggedUser();
        if (loggedUser == null || (loggedUser.Role != Role.Admin && loggedUser.Role != Role.Teacher))
        {
            return Forbid();
        }
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return NotFound();
        return _mapper.Map<UserDTO>(user);
    }

    // GET: api/Users/ben
    [NonAction]
    public async Task<ActionResult<UserDTO>> GetOne(string pseudo) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var user = await _context.Users.FindAsync(pseudo);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Transforme le membre en son DTO et retourne ce dernier
        return _mapper.Map<UserDTO>(user);
    }

    private static string HashPassword(string password)
    {
        // Generate a salt and hash the password using BCrypt
        string salt = BCrypt.Net.BCrypt.GenerateSalt(12); //number of rounds
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, salt);
        
        return hashedPassword;
    }
}