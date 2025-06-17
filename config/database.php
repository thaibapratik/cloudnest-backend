<?php
/**
 * Database Configuration File
 * 
 * This file contains the database connection settings for the Gym Management System.
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // Change this to your MySQL username
define('DB_PASS', '');     // Change this to your MySQL password
define('DB_NAME', 'gym_management'); // Database name

/**
 * Get database connection
 * 
 * @return mysqli|false Returns a mysqli connection object or false on failure
 */
function getDbConnection() {
    // Create connection
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        return false;
    }
    
    // Set charset to ensure proper encoding
    $conn->set_charset("utf8mb4");
    
    return $conn;
}

/**
 * Execute a query and return the result
 * 
 * @param string $sql The SQL query to execute
 * @param array $params Parameters to bind to the query
 * @param string $types Types of the parameters (i: integer, d: double, s: string, b: blob)
 * @return mysqli_result|bool Returns a result object or true/false
 */
function executeQuery($sql, $params = [], $types = '') {
    $conn = getDbConnection();
    
    if (!$conn) {
        return false;
    }
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        error_log("Query preparation failed: " . $conn->error);
        $conn->close();
        return false;
    }
    
    // If we have parameters, bind them
    if (!empty($params)) {
        if (empty($types)) {
            // Generate types string if not provided
            $types = str_repeat('s', count($params));
        }
        
        $stmt->bind_param($types, ...$params);
    }
    
    // Execute the statement
    $result = $stmt->execute();
    
    if (!$result) {
        error_log("Query execution failed: " . $stmt->error);
        $stmt->close();
        $conn->close();
        return false;
    }
    
    $resultSet = $stmt->get_result();
    $stmt->close();
    $conn->close();
    
    return $resultSet ? $resultSet : $result;
}

/**
 * Get a single row from the database
 * 
 * @param string $sql The SQL query to execute
 * @param array $params Parameters to bind to the query
 * @param string $types Types of the parameters
 * @return array|null Returns an associative array or null if no row found
 */
function getRow($sql, $params = [], $types = '') {
    $result = executeQuery($sql, $params, $types);
    
    if (!$result || !is_object($result)) {
        return null;
    }
    
    $row = $result->fetch_assoc();
    $result->free();
    
    return $row;
}

/**
 * Get multiple rows from the database
 * 
 * @param string $sql The SQL query to execute
 * @param array $params Parameters to bind to the query
 * @param string $types Types of the parameters
 * @return array Returns an array of associative arrays
 */
function getRows($sql, $params = [], $types = '') {
    $result = executeQuery($sql, $params, $types);
    
    if (!$result || !is_object($result)) {
        return [];
    }
    
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    
    $result->free();
    
    return $rows;
}

/**
 * Insert data into the database
 * 
 * @param string $table The table to insert into
 * @param array $data Associative array of column names and values
 * @return int|false Returns the inserted ID or false on failure
 */
function insertData($table, $data) {
    $conn = getDbConnection();
    
    if (!$conn) {
        return false;
    }
    
    $columns = implode(', ', array_keys($data));
    $placeholders = implode(', ', array_fill(0, count($data), '?'));
    
    $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        error_log("Insert preparation failed: " . $conn->error);
        $conn->close();
        return false;
    }
    
    // Generate types string and values array
    $types = '';
    $values = [];
    
    foreach ($data as $value) {
        if (is_int($value)) {
            $types .= 'i';
        } elseif (is_float($value)) {
            $types .= 'd';
        } elseif (is_string($value)) {
            $types .= 's';
        } else {
            $types .= 'b';
        }
        
        $values[] = $value;
    }
    
    $stmt->bind_param($types, ...$values);
    
    $result = $stmt->execute();
    
    if (!$result) {
        error_log("Insert execution failed: " . $stmt->error);
        $stmt->close();
        $conn->close();
        return false;
    }
    
    $insertId = $conn->insert_id;
    
    $stmt->close();
    $conn->close();
    
    return $insertId;
}

/**
 * Update data in the database
 * 
 * @param string $table The table to update
 * @param array $data Associative array of column names and values to update
 * @param string $whereClause The WHERE clause
 * @param array $whereParams Parameters for the WHERE clause
 * @return bool Returns true on success or false on failure
 */
function updateData($table, $data, $whereClause, $whereParams = []) {
    $conn = getDbConnection();
    
    if (!$conn) {
        return false;
    }
    
    $setClauses = [];
    foreach (array_keys($data) as $column) {
        $setClauses[] = "$column = ?";
    }
    
    $setClause = implode(', ', $setClauses);
    
    $sql = "UPDATE $table SET $setClause WHERE $whereClause";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        error_log("Update preparation failed: " . $conn->error);
        $conn->close();
        return false;
    }
    
    // Generate types string and values array
    $types = '';
    $values = [];
    
    foreach ($data as $value) {
        if (is_int($value)) {
            $types .= 'i';
        } elseif (is_float($value)) {
            $types .= 'd';
        } elseif (is_string($value)) {
            $types .= 's';
        } else {
            $types .= 'b';
        }
        
        $values[] = $value;
    }
    
    // Add where params
    foreach ($whereParams as $value) {
        if (is_int($value)) {
            $types .= 'i';
        } elseif (is_float($value)) {
            $types .= 'd';
        } elseif (is_string($value)) {
            $types .= 's';
        } else {
            $types .= 'b';
        }
        
        $values[] = $value;
    }
    
    $stmt->bind_param($types, ...$values);
    
    $result = $stmt->execute();
    
    if (!$result) {
        error_log("Update execution failed: " . $stmt->error);
        $stmt->close();
        $conn->close();
        return false;
    }
    
    $affectedRows = $stmt->affected_rows;
    
    $stmt->close();
    $conn->close();
    
    return $affectedRows > 0;
}