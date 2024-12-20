using chatApp.DB;
using chatApp.Hubs;
using chatApp.Seed;
using Microsoft.EntityFrameworkCore;
using visual_db_server.Services;


var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Services.Configure<ConnectionStrings>(c=>
{
    var con = builder.Configuration.GetSection("ConnectionStrings");
    Console.WriteLine(con.Value);
    
});
// Add services to the container.
builder.Services.AddDbContextPool<ChatDbContext>((sp, opt) => {
    opt.UseNpgsql(builder.Configuration.GetConnectionString("VisualDBContext"))
    .UseSnakeCaseNamingConvention();
    });
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped(typeof(IAsyncRepository<>), typeof(RepositoryBase<>));
builder.Services.AddScoped<IRegisterRepository, RegisterRepository>();
builder.Services.AddScoped<IGroupRepository, GroupRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IUnreadStatusRepository, UnreadStatusRepository>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IDbConnectionProvider, DbConnectionProvider>();
builder.Services.AddScoped<ISqlExecutor, NpgsqlExecutor>();
builder.Services.AddScoped<ICustomDatasetSnapShotService, CustomDatasetSnapShotService>();
builder.Services.AddScoped<IInformationSchemaService, InformationSchemaService>();
builder.Services.AddScoped<IRawSqlQueryService, RawSqlQueryService>();
builder.Services.AddScoped<ICustomDataSetCrudService, CustomDataSetCrudService>();
builder.Services.AddScoped<ICustomDatasetRepository, CustomDatasetRepository>();
builder.Services.AddScoped<IProcessRepository, ProcessRepository>();
builder.Services.AddAutoMapper(typeof(ChatService));
builder.Services.AddCors(options =>
{
    //options.AddDefaultPolicy(policy => policy.WithOrigins("http://localhost:4200", "http://localhost:3001").AllowAnyHeader().AllowAnyMethod().AllowCredentials());
    options.AddPolicy("all", policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("all");

app.UseAuthorization();

app.MapControllers();

// Seed Database

AppDbInitializer.Seed(app);
app.Run();
