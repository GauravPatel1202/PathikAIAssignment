# Database Migration Guide

This guide explains how to manage database schema changes using Flask-Migrate (Alembic).

## Why Use Migrations?

Migrations allow you to:

- **Preserve data** when changing database schema
- **Track schema changes** in version control
- **Rollback changes** if needed
- **Collaborate** with team members on schema changes

## Common Commands

### 1. Initialize Migrations (Already Done)

```bash
cd backend
source venv/bin/activate
flask db init
```

### 2. Create a New Migration

After modifying `models.py`, generate a migration:

```bash
flask db migrate -m "Description of changes"
```

### 3. Apply Migrations

Apply pending migrations to the database:

```bash
flask db upgrade
```

### 4. Rollback Migrations

Undo the last migration:

```bash
flask db downgrade
```

### 5. View Migration History

```bash
flask db history
```

### 6. View Current Migration

```bash
flask db current
```

## Example Workflow

### Scenario: Adding a new field to Campaign model

1. **Edit the model** (`models.py`):

   ```python
   class Campaign(db.Model):
       # ... existing fields ...
       new_field = db.Column(db.String(100), nullable=True)
   ```

2. **Generate migration**:

   ```bash
   flask db migrate -m "Add new_field to Campaign"
   ```

3. **Review the migration** in `migrations/versions/`:

   - Check that the auto-generated migration is correct
   - Edit if necessary (rare)

4. **Apply the migration**:

   ```bash
   flask db upgrade
   ```

5. **Commit to git**:
   ```bash
   git add migrations/versions/*.py
   git commit -m "Add new_field to Campaign model"
   ```

## Troubleshooting

### Issue: "Target database is not up to date"

**Solution**: Run `flask db upgrade` to apply pending migrations.

### Issue: Migration conflicts

**Solution**:

1. Check `flask db current` and `flask db history`
2. Resolve conflicts manually or create a merge migration
3. Use `flask db merge` if needed

### Issue: Need to start fresh (Development Only)

**Warning**: This deletes all data!

```bash
# Delete database
rm instance/campaigns.db

# Delete migrations
rm -rf migrations/

# Recreate migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Best Practices

1. **Always review** auto-generated migrations before applying
2. **Test migrations** on a copy of production data before deploying
3. **Never edit** applied migrations - create a new one instead
4. **Commit migrations** to version control
5. **Document** complex migrations with comments
6. **Backup** production database before running migrations

## Production Deployment

When deploying to production:

1. **Backup database first**:

   ```bash
   pg_dump campaign_manager > backup.sql
   ```

2. **Apply migrations**:

   ```bash
   flask db upgrade
   ```

3. **Verify** the application works correctly

4. **Rollback if needed**:
   ```bash
   flask db downgrade
   psql campaign_manager < backup.sql
   ```

## Migration Files Location

- **Migrations directory**: `backend/migrations/`
- **Version files**: `backend/migrations/versions/`
- **Current migration**: Check with `flask db current`

## Additional Resources

- [Flask-Migrate Documentation](https://flask-migrate.readthedocs.io/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
