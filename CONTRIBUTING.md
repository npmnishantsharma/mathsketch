<!--
Copyright (c) 2024 NishantApps
Licensed under the MIT License. See LICENSE file in the project root for full license information.
-->

# Contributing to MathSketch

First off, thank you for considering contributing to MathSketch! It's people like you that make MathSketch such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to [nishant@nishantapps.in](mailto:nishant@nishantapps.in).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain the behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.

### Development Process

1. Clone the repository
```bash
git clone https://github.com/npmnishantsharma/mathsketch.git
```

2. Install dependencies
```bash
cd mathsketch
npm install
```

3. Create a new branch
```bash
git checkout -b feature/YourFeatureName
```

4. Make your changes and commit them
```bash
git add .
git commit -m "Add YourFeatureName"
```

5. Push to your fork
```bash
git push origin feature/YourFeatureName
```

### Styleguides

#### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

#### JavaScript/TypeScript Styleguide

* Use 2 spaces for indentation
* Use semicolons
* Use `const` for all of your references; avoid using `var`
* Use template literals instead of string concatenation
* Use meaningful variable names

#### CSS/Tailwind Styleguide

* Use Tailwind utility classes when possible
* Follow BEM naming convention for custom CSS
* Keep custom CSS to a minimum

### Documentation

* Use Markdown for documentation
* Include code examples when necessary
* Keep documentation up to date with code changes

## Project Structure

```
mathsketch/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   └── DrawingCanvas.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── ...
├── public/
│   └── ...
└── ...
```

## Testing

* Write tests for new features
* Run existing tests before submitting PR
* Ensure all tests pass

```bash
npm run test
```

## Additional Notes

### Issue and Pull Request Labels

* `bug`: Something isn't working
* `enhancement`: New feature or request
* `documentation`: Improvements or additions to documentation
* `good first issue`: Good for newcomers
* `help wanted`: Extra attention is needed

## Recognition

Contributors who submit a PR that gets merged will be added to the Contributors section in the README.md.

## Questions?

Feel free to contact us if you have any questions. You can reach us at:
* Email: [nishant@nishantapps.in](mailto:nishant@nishantapps.in)
* Twitter: [@_Nishant_Apps](https://twitter.com/_Nishant_Apps)
* Instagram: [@nishantapps4](https://www.instagram.com/nishantapps4)

Thank you for contributing to MathSketch! 🚀 