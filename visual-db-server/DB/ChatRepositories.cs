namespace chatApp.DB
{
    public interface IRegisterRepository : IAsyncRepository<RegisterEntity> { }
    public interface IGroupRepository : IAsyncRepository<GroupEntity> { }
    public interface IMessageRepository : IAsyncRepository<MessageEntity> { }

    public interface IUnreadStatusRepository : IAsyncRepository<UnreadStatusEntity> { }

    public interface ICustomDatasetRepository : IAsyncRepository<CustomDataset> { }
    public interface IProcessRepository : IAsyncRepository<Process> { }

    public class CustomDatasetRepository : RepositoryBase<CustomDataset>, ICustomDatasetRepository
    {
        public CustomDatasetRepository(ChatDbContext dbContext) : base(dbContext)
        {
        }
    }

    public class ProcessRepository : RepositoryBase<Process>, IProcessRepository
    {
        public ProcessRepository(ChatDbContext dbContext) : base(dbContext)
        {
        }
    }

    public class RegisterRepository : RepositoryBase<RegisterEntity>, IRegisterRepository
    {
        public RegisterRepository(ChatDbContext dbContext) : base(dbContext)
        {
        }
    }

    public class GroupRepository : RepositoryBase<GroupEntity>, IGroupRepository
    {
        public GroupRepository(ChatDbContext dbContext) : base(dbContext)
        {
        }
    }

    public class MessageRepository : RepositoryBase<MessageEntity>, IMessageRepository
    {
        public MessageRepository(ChatDbContext dbContext) : base(dbContext)
        {
        }
    }

    public class UnreadStatusRepository : RepositoryBase<UnreadStatusEntity>, IUnreadStatusRepository
    {
        public UnreadStatusRepository(ChatDbContext dbContext) : base(dbContext)
        {
        }
    }
}
