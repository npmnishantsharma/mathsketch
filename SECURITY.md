<!--
Copyright (c) 2024 NishantApps
Licensed under the MIT License. See LICENSE file in the project root for full license information.
-->

# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of MathSketch seriously. If you believe you have found a security vulnerability, please report it through GitHub's private vulnerability reporting system:

1. Go to [MathSketch Security Advisories](https://github.com/npmnishantsharma/mathsketch/security/advisories)
2. Click on "New draft security advisory"
3. Fill in the details of the vulnerability
4. Submit the report

### What to Include in Your Report

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Process

1. We will acknowledge your report within 48 hours through GitHub.
2. We will provide a more detailed response within 72 hours.
3. We will keep you informed about our progress in fixing the vulnerability.
4. After the fix has been released, we may publicly disclose the vulnerability.

## Security Best Practices

### For Contributors

1. **Code Review**
   - All code changes must go through a review process
   - Security-sensitive code requires additional review
   - Use static analysis tools when possible

2. **Dependencies**
   - Keep all dependencies up to date
   - Regularly run `npm audit` to check for vulnerabilities
   - Use only trusted and well-maintained packages

3. **Authentication & Authorization**
   - Follow secure coding practices
   - Implement proper input validation
   - Use secure session management

### For Users

1. **Account Security**
   - Use strong passwords
   - Enable two-factor authentication if available
   - Keep your access tokens secure

2. **API Usage**
   - Keep API keys confidential
   - Use HTTPS for all API calls
   - Implement rate limiting where appropriate

## Security Features

- HTTPS enforcement
- Input sanitization
- XSS protection
- CSRF protection
- Rate limiting
- Content Security Policy (CSP)

## Known Issues

Any known security issues will be listed here. Currently, there are no known security issues.

## Security Updates

Security updates will be released as soon as possible after a vulnerability is discovered and verified. Updates will be published through:

1. GitHub Security Advisories
2. GitHub Releases
3. Repository Discussions

## Contact

For general security questions, you can also reach us through:
- GitHub Discussions: [MathSketch Discussions](https://github.com/npmnishantsharma/mathsketch/discussions)
- Lead Developer: [@npmnishantsharma](https://github.com/npmnishantsharma)

## Acknowledgments

We would like to thank the following individuals and organizations for their contributions to the security of MathSketch:

- Security researchers who responsibly disclose vulnerabilities
- Open source security tool maintainers
- Our dedicated security team

## Updates to This Policy

This security policy may be updated from time to time. Please refer to the Git history for this file to review changes.

---

Last updated: 2024-03-11