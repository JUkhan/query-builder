using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace visual_db_server.Controllers
{
    
    public class BaseController : ControllerBase
    {
        private static readonly JsonSerializerSettings DefaultJsonSettings;
        static BaseController()
        {
            DefaultJsonSettings = new JsonSerializerSettings();
            DefaultJsonSettings.Converters.Add(new StringEnumConverter());
            DefaultJsonSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        }

        protected ActionResult JsonNet(object data, JsonSerializerSettings? settings = null)
        {
            var json = JsonConvert.SerializeObject(data, settings ?? DefaultJsonSettings);
            return Content(json, "application/json");
        }

        protected ActionResult CrudDataJsonNet(object data)
        {
            return CamelCaseJsonNet(data);
        }

        protected ActionResult CamelCaseJsonNet(object data)
        {
            return JsonNet(data, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                Formatting = Formatting.None
            });
        }

        protected ActionResult SnakeCaseJsonNet(object data)
        {
            var contractResolver = new DefaultContractResolver
            {
                NamingStrategy = new SnakeCaseNamingStrategy()
            };

            return JsonNet(data, new JsonSerializerSettings
            {

                ContractResolver = contractResolver,
                Formatting = Formatting.None
            });
        }

        protected JsonResult Json(object data, JsonSerializerSettings? settings = null)
        {
            return new JsonResult(data, settings ?? DefaultJsonSettings);
        }
    }
}
