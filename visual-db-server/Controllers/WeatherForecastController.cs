using chatApp.Hubs;
using chatApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace visual_db_server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        protected readonly IChatService _chatService;
        
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, IChatService service)
        {
            _logger = logger;
            _chatService = service;
        }

        [HttpGet("GetGroups", Name = "GetGroups")]
        public async Task<IEnumerable<ChatGroup>> GetGroups()
        {
            var data = await _chatService.GetGroups("", "http://localhost:3000");
            return data;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public IEnumerable<WeatherForecast> Get()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }
}
