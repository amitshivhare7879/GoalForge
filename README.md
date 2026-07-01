# GoalForge

A high-fidelity goal tracking application with AI-driven pathfinding, staking, and cinematic feedback loops.

## Features

- **AI Pathfinder**: Personalized goal planning using Claude 3.5 Sonnet.
- **Staking System**: Financial commitment for goals with automated yields and buffer days.
- **Cinematic Quench**: Visual feedback for goal completion with high-fidelity animations.
- **Verification APIs**: Integration with GitHub, LeetCode, and Location for passive proof of work.
- **Forge Score**: Reputation system based on discipline and consistency.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: Tailwind CSS & CSS Variables (Prototype Parity)

## Getting Started

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables in `.env.local`:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    ANTHROPIC_API_KEY=your_anthropic_key
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## Project Structure

- `src/app`: Next.js pages and API routes.
- `src/components`: Reusable UI components and widgets.
- `src/lib`: Shared logic and helper functions.
- `supabase_schema.sql`: Database schema for Supabase.

## Quench Animation

The project features a custom `QuenchAnimation` component that provides visual closure when a goal is completed. It utilizes Framer Motion to create a cinematic transition from "Hot" (active) to "Cold" (hardened discipline).
