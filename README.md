# SQL Trainer

SQL Trainer is a comprehensive web application designed to facilitate the creation, management, and undertaking of online quizzes with a focus on SQL (Structured Query Language). This platform uniquely caters to educators and students, enhancing the learning experience by allowing the formulation of questions in natural language and the submission of answers via SQL queries. It leverages a database schema assumed to be preloaded in XAMPP, simulating real-world SQL interaction within an educational context.

## Features

- **User-Friendly Interface**: Two distinct user roles are defined: `Student` and `Teacher`, each with custom functionalities tailored to enhance their interaction with the platform.
- **Dynamic Quiz Management**: Features include creating quizzes with detailed attributes (name, description, publication status, etc.), and managing quiz lifecycles from creation to closure.
- **Interactive Learning and Testing**: Supports both test quizzes with single attempts and standard quizzes with unlimited attempts, encouraging iterative learning through practice.
- **Real-Time SQL Execution and Feedback**: Executes student-submitted SQL queries in real-time, offering immediate feedback based on the accuracy of query results compared to predefined solutions.
- **Comprehensive Attempt Tracking**: Monitors quiz attempts meticulously, allowing ongoing attempts to be resumed or closed before starting new ones. Provides detailed feedback for each attempt, including correctness and submission timestamps.
- **More personal features**:Dark-mode, Admin panel, etc.

## Getting Started

### Prerequisites

- Git for repository cloning.
- XAMPP for database management and local server setup.
- PHP 7 or higher as the primary backend language.

### Installation

1. Clone the project repository.
2. Navigate to the project directory and set up your environment:
3. Import the provided database schema into your MySQL instance via XAMPP to set up the necessary database structure.

### Configuration

- Adjust `config.php` to reflect your local database settings and any other environment-specific configurations.

## Usage

The application differentiates between student and teacher roles, offering functionalities tailored to each:

- **Students** can view published quizzes, attempt quizzes according to defined rules (e.g., time restrictions, test/non-test distinctions), and receive instant feedback on submissions.
- **Teachers** can create and manage quizzes, including setting up questions and correct answers, publishing quizzes, and reviewing all attempts.

## Development and Contributions

Contributors looking to improve SQL Trainer or add new features are welcome. We encourage you to fork the repository, make your changes, and submit a pull request. Please ensure your contributions adhere to the project's coding standards and contribute meaningfully to its objectives.

## License

SQL Trainer is open-sourced under the MIT license. We encourage educational institutions, teachers, and students to leverage this tool to enhance the learning and teaching of SQL.

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





