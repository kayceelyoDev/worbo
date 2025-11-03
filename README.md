# WORBO

A modern Wordle clone built with Next.js 15 and Supabase. Challenge yourself to guess the word in 6 tries, compete on the global leaderboard, and track your stats!

## Features

- **Daily Word Challenges**: Guess a new 5-letter word every day
- **Multiple Game Modes**: Standard mode and easy mode for different difficulty levels
- **Global Leaderboard**: Compete with players worldwide and climb the rankings
- **User Authentication**: Secure sign-up and sign-in with Supabase Auth
- **Profile System**: Track your personal stats, streaks, and achievements
- **Real-time Scoring**: Points-based system with streak multipliers
- **Responsive Design**: Beautiful UI built with Tailwind CSS that works on all devices
- **Smart Feedback**: Color-coded hints after each guess (green, yellow, gray)

## Tech Stack

- **Frontend**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd worbo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up your Supabase database:

Create the following tables in your Supabase project:

- `userProfile` - Stores user profile information and stats
- Additional tables for leaderboard and game tracking

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the game.

## Project Structure

```
worbo/
├── app/
│   ├── api/
│   │   └── dictionary/      # Word validation API
│   ├── auth/
│   │   ├── signin/          # Sign in page
│   │   ├── signup/          # Sign up page
│   │   └── makeprofile/     # Profile creation
│   ├── game/
│   │   ├── page.tsx         # Main game page
│   │   └── easymode/        # Easy mode variant
│   ├── leaderboard/         # Global leaderboard
│   ├── menu/                # Game menu
│   ├── profile/             # User profile page
│   └── page.tsx             # Landing page
├── lib/
│   ├── supabaseClient.ts    # Supabase client setup
│   ├── supabaseAdmin.ts     # Supabase admin client
│   └── getRank.ts           # Ranking utilities
└── public/                  # Static assets

```

## How to Play

1. **Sign Up/Sign In**: Create an account or log in to track your progress
2. **Guess the Word**: You have 6 attempts to guess a 5-letter word
3. **Get Feedback**: After each guess, tiles change color:
   - **Green**: Letter is correct and in the right position
   - **Yellow**: Letter is in the word but in the wrong position
   - **Gray**: Letter is not in the word
4. **Build Your Streak**: Guess correctly to maintain your winning streak
5. **Compete**: Check the leaderboard to see how you rank against other players

## Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server
```

## Features in Detail

### Game Modes
- **Standard Mode**: Traditional Wordle gameplay with 6 attempts
- **Easy Mode**: More forgiving variant for casual players

### Scoring System
- Points awarded based on guesses used
- Streak multipliers for consecutive wins
- Penalties for restarting games
- Real-time score updates

### Profile & Stats
- Track total games played
- Monitor win/loss ratio
- View current streak
- See personal best scores

### Leaderboard
- Global rankings
- Friend-specific leaderboards
- Multiple ranking criteria
- Real-time updates

## Deployment

### Deploy on Vercel

The easiest way to deploy Worbo is to use the [Vercel Platform](https://vercel.com):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

### Other Platforms

You can also deploy to any platform that supports Next.js applications:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean App Platform

Make sure to set up the required environment variables on your chosen platform.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (private) |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by the original Wordle game by Josh Wardle
- Built with Next.js and Supabase
- Icons provided by Lucide React
