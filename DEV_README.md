# SparQ Plug - Development Guide

## Quick Start for Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Access the app**:

   - Home: <http://localhost:3001>
   - Login: <http://localhost:3001/login>
   - Admin: <http://localhost:3001/admin>
   - Manager: <http://localhost:3001/manager>
   - Client: <http://localhost:3001/client>

## Development Features

### Authentication

- **Development Mode**: Simple role-based login (no external dependencies)
- **Production Mode**: SSO integration with external portal
- **Automatic Detection**: App detects localhost and switches to dev mode

### Available Roles

- **Admin**: Full system access, user management, platform settings
- **Manager**: Multi-client management, team oversight
- **Client**: Individual account management, content planning

### Environment Configuration

The app uses `.env.local` for development settings:

- `NODE_ENV=development` - Enables dev mode
- `APP_BASE_PATH=""` - Serves at root (empty) vs `/app` prefix
- `SKIP_AUTH=true` - Bypasses production auth flows
- Development JWT secrets for testing

### Development Scripts

- `npm run dev` - Start with Turbopack (fastest)
- `npm run dev:clean` - Clean build and restart
- `npm run dev:3000` - Force port 3000
- `npm run type-check` - TypeScript validation

### Project Structure

```text
src/app/
├── admin/          # Admin dashboard and features
├── manager/        # Manager tools and client oversight
├── client/         # Client dashboard and content tools
├── login/          # Authentication pages
└── api/           # API routes and integrations

src/components/     # Reusable UI components
src/lib/           # Utilities and integrations
```

### Key Features to Develop

- [ ] Social media platform integrations
- [ ] Content planner system
- [ ] Analytics and reporting
- [ ] Media library management
- [ ] Team collaboration tools
- [ ] Billing and subscription management

## Production vs Development

| Feature | Development | Production |
|---------|-------------|------------|
| Authentication | Local role selection | External SSO portal |
| Base Path | Root (/) | /app prefix |
| Error Handling | Detailed errors | User-friendly messages |
| API Integrations | Mocked responses | Live API calls |
| Database | Local/mock data | Production database |

## Next Steps

1. Start the dev server: `npm run dev`
2. Visit <http://localhost:3001/login>
3. Choose a role to explore the interface
4. Begin developing features in role-specific directories

## Need Help?

- Check the main README.md for deployment info
- Review component files for UI patterns
- API routes in `src/app/api/` for backend integration examples
