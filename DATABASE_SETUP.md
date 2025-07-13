# Database Setup with Prisma + MongoDB

This guide explains how to set up the database for the Mulumela dashboard using Prisma ORM with MongoDB.

## 🗄️ Prerequisites

1. **MongoDB Database**: You'll need a MongoDB database URL
   - **MongoDB Atlas** (recommended): Free cloud database
   - **Local MongoDB**: Self-hosted database
   - **Other providers**: Any MongoDB-compatible service

2. **Clerk Account**: For user authentication (see CLERK_SETUP.md)

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URL Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Clerk Webhooks (for automatic user sync)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/mulumela?retryWrites=true&w=majority
```

### 2. Get Your MongoDB URL

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Go to "Database Access" → Create a database user
4. Go to "Network Access" → Add your IP address (or 0.0.0.0/0 for all)
5. Go to "Database" → Click "Connect" → "Connect your application"
6. Copy the connection string and replace `<password>` with your database user password

#### Option B: Local MongoDB
```bash
DATABASE_URL=mongodb://localhost:27017/mulumela
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# OR create and run migrations (for production)
npx prisma migrate dev --name init
```

### 4. Set Up Clerk Webhooks (Optional but Recommended)

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to "Webhooks"
3. Click "Add Endpoint"
4. Set URL to: `https://your-domain.com/api/webhooks/clerk`
5. Select events: `user.created`, `user.updated`, `user.deleted`
6. Copy the webhook secret and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

## 📊 Database Schema

The application includes three main models:

### User Model
- Stores user information synced from Clerk
- Links Clerk user ID to database records
- Includes role-based access control

### Guest Model
- Manages guest information
- Tracks invitations and attendance
- Links to the user who created the guest

### Traffic Model
- Stores daily visitor statistics
- Used for dashboard analytics

## 🔧 API Routes

### User Management
- `GET /api/users` - Get current user (or all users if admin)
- `POST /api/users` - Create or update user

### Webhook Handler
- `POST /api/webhooks/clerk` - Automatic user sync from Clerk

## 🛠️ Development Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Deploy migrations to production
npx prisma migrate deploy
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Error**: Check your MongoDB URL and network access
2. **Schema Sync Issues**: Run `npx prisma db push` to sync schema
3. **Client Not Generated**: Run `npx prisma generate`
4. **Webhook Not Working**: Ensure webhook URL is accessible and secret is correct

### Useful Commands

```bash
# Check connection
npx prisma db pull

# View generated client
npx prisma studio

# Validate schema
npx prisma validate
```

## 🚀 Production Deployment

1. **Environment Variables**: Set all required vars in your hosting platform
2. **Database Migrations**: Run `npx prisma migrate deploy`
3. **Webhook URL**: Update Clerk webhook to your production domain
4. **Connection Pooling**: Consider using Prisma Data Proxy for serverless

## 📚 Next Steps

1. **Test the setup**: Run `npm run dev` and sign up a new user
2. **Check database**: Use `npx prisma studio` to view created records
3. **Customize schema**: Modify `prisma/schema.prisma` as needed
4. **Add features**: Implement guest management and analytics

## 🎯 Integration with Clerk

The database automatically syncs with Clerk through:
- **Webhooks**: Real-time user creation/updates
- **API Routes**: Manual user management
- **Middleware**: Authentication checks

Users created in Clerk are automatically added to your database with all profile information synced.

---

🔗 **Related Documentation**:
- [Clerk Setup Guide](./CLERK_SETUP.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com) 