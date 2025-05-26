# Inclusive Project Guidelines

## Language and Thought Patterns Guidelines

### Inclusivity in Communication
- **Use identity-first language**: Refer to "Autistic person," "ADHD person," or "AuDHD person" rather than "person with autism/ADHD/AuDHD". This reflects the understanding that neurodivergence is an integral part of identity, not a condition someone "has".
- Strive to use language that is inclusive and accessible to all team members, regardless of background or identity.

### Tolerance and Awareness
- Recognize that everyone operates with assumptions shaped by their culture, experience, and environment. These assumptions influence how we think about problems and solutions.
- Rather than denying or ignoring these assumptions, acknowledge them openly as a first step to addressing challenges creatively.
- By paying attention to cultural and personal assumptions, we can uncover new opportunities for innovation and better design.
- Encourage diverse thought patterns and approaches to problem-solving, as this diversity can lead to more robust and inclusive solutions.
- The concepts of Universal Design stress that by improving conditions for the individuals most in need of support, we improve conditions for all individuals

## Development Standards

### Test-Driven Development (TDD)
1. **Write a failing test first** that describes the desired behavior.
  - a test will not as little as possible about the internal details of the code it will test
  - a test will only mock external dependencies. If it seems like a good idea to mock internal dependencies this is a code smell and indicates the need to refactor existing code
2. **Write minimal implementation code** to make the test pass.
3. **Refactor** code while maintaining test coverage.
  - Remove repetative code
  - extract methods to reduce complexity and increase readability
  - separate concerns if a single class/function contains more than one
  - introduce interfaces where appropriate
4. Always run the tests before committing code changes to ensure everything still passes.

### Clean Architecture Principles
- Maintain strict separation between layers:
  - **Core Domain**: Contains business entities and rules, completely framework-independent.
  - **Use Cases**: Application-specific business rules.
  - **Adapters**: Convert data between external systems and the application.
  - **Frameworks/Drivers**: Connect to external systems.

### Dependency Management
- Domain entities should not depend on any external libraries or frameworks.
- Flow of dependencies should point inward (toward domain core).
- Avoid circular dependencies between layers.
- composition over inheritance

### General Programming Practices
- Follow coding standards and style guidelines relevant to the programming language used in the project.
- Use clear and consistent naming conventions.
- Include appropriate documentation and comments for all public methods and classes.
- Write modular, reusable, and efficient code.
- YAGNI - Ya Ain't Gonna Need It - don't write something that you don't need to just becuase you think you might. Get a refined use case first.
- persistance is always a detail
- UI is always a detail
- external dependencies are always details.

### Performance Optimization
- never prices an item in a collection more often than required by property architecture
- always cache expensive results
-clean up unused code

### Security Concerns
- security from the very beginning
- make it as automatic as possible for the dev
- don't get stuck to a provider

## SOLID Principles

The SOLID principles help in designing software that is easier to maintain and extend. They stand for:

1. **Single Responsibility Principle (SRP)**  
   A class should have only one reason to change, meaning it should only have one job or responsibility.

2. **Open/Closed Principle (OCP)**  
   Software entities (classes, modules, functions, etc.) should be open for extension but closed for modification.

3. **Liskov Substitution Principle (LSP)**  
   Subtypes must be substitutable for their base types without altering the correctness of the program.

4. **Interface Segregation Principle (ISP)**  
   A class should not be forced to implement interfaces it does not use. Instead, create smaller, more specific interfaces.

5. **Dependency Inversion Principle (DIP)**  
   High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

## Contribution Process
- Create a feature branch for each new feature.
- Always start with a failing test.
- Request peer reviews before merging to main.
- Keep PRs focused on single concerns.
- Collaborate respectfully and embrace constructive feedback.
