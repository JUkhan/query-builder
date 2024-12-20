using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace chatApp.DB
{
    public class ChatDbContext(DbContextOptions<ChatDbContext> options): DbContext(options)
    {
        public DbSet<RegisterEntity> Registers { get; set; }
        public DbSet<GroupEntity> Groups { get; set; }
        public DbSet<MessageEntity> Messages { get; set; }
        public DbSet<UnreadStatusEntity> UnreadStatuses { get; set; }

        public DbSet<CustomDataset> CustomDataset { get; set; }

        public DbSet<Process> Processes { get; set; }

    }


    public interface IEntity<TKey>
    {
        TKey Id { get; set; }
    }
    public abstract class Entity<T> : IEntity<T>
    {
      
        public T Id { get; set; } = default!;
    }


    public abstract class Entity : Entity<string>
    {
        protected Entity()
            : base()
        {
            Id = Guid.NewGuid().ToString("N");
        }
    }

    public abstract class AuditableEntity : Entity
    {
        protected AuditableEntity() : base()
        {

        }

        public string? CreatedBy { get; set; }
        public DateTime? CreateTime { get; set; }
        public string? LastModifiedBy { get; set; }
        public DateTime? LastModifiedTime { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class CustomDataset : AuditableEntity
    {
       
        public string? DatasetName { get; set; }
        public string? WebQuery { get; set; }
        public string? MobileQuery { get; set; }
        public bool? IsQueryForMobile { get; set; }
        public bool? IsDataDownloadableForMobile { get; set; }
        public string? QueryType { get; set; }
        public string? QueryCreationMode { get; set; }
        public string? FullJsonData { get; set; }
        public string? AdditionalConfig { get; set; }
    }

    public class Process : AuditableEntity
    {
        public string? Name { get; set; }
        public string? StepConfig { get; set; }
        public string? SurveyTypeTemplateId { get; set; }
        public string? Type { get; set; }

    }

    //public class EntityBase { }
    public class RegisterEntity: AuditableEntity
    {
        [Key]
        public string Origin { get; set; }
        public string CompanyName { get; set;}
    }

    public class GroupEntity : AuditableEntity
    {
        //public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Origin { get; set; }
        public string GroupName { get; set; }
        public bool IsPrivate { get; set; }
        public string UsersJson { get; set; }
    }

    public class MessageEntity : AuditableEntity
    {
        //public string Id { get; set; }= Guid.NewGuid().ToString();
        public string GroupId { get; set; }
        public string Message { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }

    }
    
    public class UnreadStatusEntity : AuditableEntity
    {
        //public string Id { get; set; }= Guid.NewGuid().ToString();
        public string UserId { get; set; }
        public string GroupName { get; set; }
        public string Origin { get; set; }
    }
}
