# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do not** open a public issue
2. Email security details to: security@flow402.com (or create a private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

## Security Best Practices

### For Users

- Keep dependencies up to date
- Use strong, unique passwords
- Enable two-factor authentication where available
- Regularly review access logs
- Report suspicious activity immediately

### For Developers

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Validate all user input
- Implement rate limiting
- Use parameterized queries to prevent SQL injection
- Keep dependencies updated

## Security Features

Flow402 implements the following security measures:

- **Authentication**: JWT tokens with httpOnly cookies
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Token-based CSRF protection
- **Audit Logging**: Comprehensive security event logging
- **Rate Limiting**: Protection against brute force attacks (planned)

## Known Security Considerations

- Mock payment provider is for development only
- Production deployments should use real x402 providers
- Ensure proper environment variable management
- Regular security audits recommended

## Security Updates

Security updates are released as soon as possible after discovery and verification. Critical vulnerabilities are addressed within 48 hours.

## Disclosure Policy

- Vulnerabilities are disclosed after fixes are available
- Credit is given to reporters (unless requested otherwise)
- Coordinated disclosure timeline: 90 days from report

## Contact

For security-related inquiries: security@flow402.com

