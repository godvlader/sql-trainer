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




