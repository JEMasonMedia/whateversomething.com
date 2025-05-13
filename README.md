# Whateversomething.com

**Live site:** [https://whateversomething.com/](https://whateversomething.com/)

A simple, open-source utility app providing various useful tools for developers and regular users.  
This project includes:

- **Color Picker:** Easily select and copy color values in multiple formats.
- **Password Generator:** Create secure, customizable passwords with options for length and character types.
- **Random Number Generator:** Generate random numbers with support for negative values, decimals, and significant figures.
- **User Data Parsing:** Parse and convert user data from CSV, YAML, and XML formats, compatible with [randomuser.me](https://randomuser.me/) data structure.

## Features

- Modern, responsive UI built with React and Tailwind CSS
- Copy-to-clipboard functionality for color values
- Customizable password and number generation
- User data parsing utilities for multiple formats
- Dark theme support
- No tracking, ads, or analytics

## Getting Started

1. Clone the repository:

   ```sh
   git clone https://github.com/JEMasonMedia/whateversomething.com.git
   cd whateversomething.com
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Build for production:

   ```sh
   npm run build
   ```

## User Data Parsing

This project supports parsing user data from CSV, YAML, and XML formats using the utilities in `src/utils/parseUserData.ts`.

### Supported Formats

- **CSV**
- **YAML**
- **XML**

### Usage

You can use the `parseUserData` function to convert raw user data into a consistent format:

```typescript
import { parseUserData } from './src/utils/parseUserData'

// Example usage:
const users = await parseUserData(dataString, 'csv') // or 'yaml' or 'xml'
```

### Data Source

User data format is compatible with [randomuser.me](https://randomuser.me/).

> This project uses data structures and sample data inspired by [randomuser.me](https://randomuser.me/).  
> Please credit [randomuser.me](https://randomuser.me/) if you use their data or API.

## License

This project is licensed under the [MIT License](./LICENSE).

---

**Contributions are welcome!**
