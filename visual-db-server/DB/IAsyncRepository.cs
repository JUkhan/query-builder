using System.Linq.Expressions;

namespace chatApp.DB
{
   
        public interface IAsyncRepository<T> where T : AuditableEntity
        {
            Task<IReadOnlyList<T>> GetAllAsync();
            Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>> predicate);
            Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>> predicate = null,
                                            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
                                            string includeString = null,
                                            bool disableTracking = true);
            Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>> predicate = null,
                                           Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
                                           List<Expression<Func<T, object>>> includes = null,
                                           bool disableTracking = true);
            Task<T> GetByIdAsync(object id);
            Task<T> AddAsync(T entity);
            Task<int> UpdateAsync(T entity);
            Task<int> DeleteAsync(T entity);
            Task<int> AddRangeAsync(IEnumerable<T> range);
            Task<int> DeleteRangeAsync(IEnumerable<T> range);
            IQueryable<T> GetConditional(Expression<Func<T, bool>> expression);
    }
    
}
