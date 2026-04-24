# Cybersecurity Internship Project

## Overview
This project is a simple Node.js web application that I used to understand common web security issues and how to fix them. The main idea was to first test the application for vulnerabilities and then improve it step by step.

## Features
- Fixed XSS by sanitizing user input before displaying it  
- Added input validation using validator  
- Secured passwords using bcrypt hashing  
- Implemented basic JWT authentication after login  
- Added Helmet for better security headers  
- Added logging using Winston  

## How to Run

1. Install dependencies:
npm install  

2. Start the server:
npm start  

3. Open in browser:
http://localhost:5006  

## Project Structure
- index.js → main application logic  
- public / views → frontend pages  
- security.log → logs of application activity  

## Summary
In this project, I explored how common vulnerabilities like XSS, poor input handling, and plain text password storage can affect a web application. I then applied basic fixes to improve security and tested the application again to confirm the changes.
