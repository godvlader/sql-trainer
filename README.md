# SQL Trainer Application

The SQL Trainer Application is designed to facilitate the creation, management, and taking of online quizzes in the context of a database basics course. It allows instructors to create quizzes, where questions are expressed in natural language. Students answer these questions by submitting SQL query responses. Each quiz is associated with a database schema (Database class) assumed to be pre-loaded in XAMPP (for example, the suppliers database with SPJ, S, P, and J tables). Additionally, the application features an admin panel for comprehensive user control and management.

## Technologies Used
- **Server**: ASP.NET Core and EF Core for database access.
- **Client**: Single Page Application (SPA) in Angular.
- **Communication**: Client-server interactions are facilitated through a secure REST API provided by the server.

## Features

### For Visitors (Not Logged In)
- **Login**: Access the application by logging in.
- **Signup** (optional): Register as a new user. By default, a new user is considered a student.

### For Logged-In Users (All Types)
- **Logout**: Securely sign out of the application.

### For Students
- **View Published Quizzes**: After logging in, students are directed to a homepage displaying two lists:
  - A list of quizzes that are not tests.
  - A list of quizzes that are tests.
  Each list includes an "Actions" column showing possible actions for each quiz according to the business rules.
- **Filtering**: A filtering area is provided to refine both lists based on relevant quiz and question data.
- **Attempt Creation, Viewing, or Modification**: From the lists, students can open an attempt (new or existing, for editing or read-only) and:
  - Navigate through questions in the order defined in the database using "next" and "previous" buttons.
  - If the quiz is open for editing, submit an SQL query as an answer for evaluation.

### For Professors
- **View All Quizzes**: Professors see a list of all quizzes (published or not) upon login, with an editing icon next to each quiz.
- **Filtering**: An area to filter quizzes based on relevant data.
- **Quiz Management**: Professors can create a new quiz, modify quiz elements (name, description, associated database, type, status), and manage quiz questions (add, move, delete, modify questions and their solutions).

### Admin Panel
- **User Control**: Administrators have access to a comprehensive admin panel for user management. This includes creating, editing, and deleting user accounts, as well as assigning roles and permissions.
- **Quiz and Database Management**: Beyond user control, the admin panel provides tools for managing quizzes and associated database schemas, ensuring that all content is up to date and accurate.

## Business Rules
- The application differentiates test quizzes from regular quizzes, with specific behaviors for each.
- Quiz and attempt integrity, including access rights, must be enforced by the backend.
- Modifications to quizzes are restricted under certain conditions to ensure data integrity.

## Non-Functional Requirements
- **Data Integrity**: The backend must ensure data integrity, respecting all business rules and access rights during data modifications.
- **Cascading Deletions**: Deleting an instance that initiates a composition relationship requires cascading deletions of related instances, with a clear and precise confirmation dialog to the user.

## Getting Started

To get started with the SQL Trainer Application, ensure you have XAMPP installed and the required database schemas loaded. Follow these steps to set up your environment:

1. Install XAMPP and start the Apache and MySQL services.
2. Load the example database schema (e.g., the suppliers database with tables SPJ, S, P, J) into MySQL.
3. Clone this repository and navigate to the project directory.
4. Follow the setup instructions provided in the SETUP.md file to configure the application.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.


Welcome page
![image](https://github.com/godvlader/sql-trainer/assets/79583000/b66cb6cf-45cd-4bbd-90c7-d22c8833a8d4)

Login page
![image](https://github.com/godvlader/sql-trainer/assets/79583000/59b54134-20e3-43aa-84a8-6d548493540f)

Signup page
![image](https://github.com/godvlader/sql-trainer/assets/79583000/a5cfb823-0220-46e1-bbb7-c1a60c0eeba5)

Quizzes page
![image](https://github.com/godvlader/sql-trainer/assets/79583000/5afbbed2-cee7-4eac-9d88-e3d0112b8d86)

Inside quiz with already answered questions
![image](https://github.com/godvlader/sql-trainer/assets/79583000/2e0b4a60-1b2a-4eb3-9dfb-b9f0597bcd6b)

Unanswered question
![image](https://github.com/godvlader/sql-trainer/assets/79583000/1ec3c00c-5139-49c2-b44a-1c63c981f1b1)

Wrong answer errors
![image](https://github.com/godvlader/sql-trainer/assets/79583000/65327227-dd8d-405c-b0b6-57e8c1f382c0)

Correct answer
![image](https://github.com/godvlader/sql-trainer/assets/79583000/5cb38050-4e69-45b7-9a86-341ceea90e0d)

Finished test
![image](https://github.com/godvlader/sql-trainer/assets/79583000/f0e6a5e4-ac41-41dd-80eb-23a8fcc6785b)

Teacher's view
![image](https://github.com/godvlader/sql-trainer/assets/79583000/6c83907a-6cd7-4813-9596-699341a47116)

Add new quiz
![image](https://github.com/godvlader/sql-trainer/assets/79583000/618c69a4-3074-4388-b4d7-baafdb1ae576)

Edit quiz
![image](https://github.com/godvlader/sql-trainer/assets/79583000/1ab30cd3-3d86-4041-b663-138b1636808e)

Deleting Quiz
![image](https://github.com/godvlader/sql-trainer/assets/79583000/2c2c08ec-982f-4f8e-a492-72351267407a)

Filter
![image](https://github.com/godvlader/sql-trainer/assets/79583000/b7a6fb89-a6ee-480c-89e8-0d5c8339fe52)

Admin panel with users
![image](https://github.com/godvlader/sql-trainer/assets/79583000/6399fd59-c39f-4f94-9710-c6dc70ef5aef)

Add new user
![image](https://github.com/godvlader/sql-trainer/assets/79583000/57d7783b-92a7-4057-8629-a67fb5207f9d)

Editing user
![image](https://github.com/godvlader/sql-trainer/assets/79583000/834c2411-a4e5-496e-83c5-914e44e833c7)





