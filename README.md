# WealthFlow – AI-Powered Personal Finance Manager

Live Demo: https://personal-finance-manager-kvchryie1.vercel.app/

## Overview

WealthFlow is a full-stack MERN-based Personal Finance Management platform that helps users track income, expenses, budgets, savings goals, and financial health through interactive analytics dashboards and AI-powered insights.

The application provides secure authentication, budget monitoring, transaction management, financial reporting, and intelligent spending recommendations using advanced analytics and Google Gemini AI integration.

---

## Key Features

### Authentication & Security

* JWT-based Authentication
* Password Hashing using bcryptjs
* Protected Routes
* Forgot Password & Reset Password
* Secure API Access Control

### Financial Management

* Income Tracking
* Expense Tracking
* Transaction Categorization
* Monthly Budget Management
* Savings Goal Tracking
* Budget Exceeded Alerts

### Advanced Analytics Dashboard

* Income vs Expense Trends
* Expense Distribution Analysis
* Budget Utilization Monitoring
* Savings Growth Tracking
* Income Source Breakdown
* Financial Health Score
* Goal Progress Visualization

### AI Financial Advisor

* Gemini AI Integration
* Personalized Spending Insights
* Savings Recommendations
* Budget Optimization Suggestions
* Rule-Based Fallback Engine

### Reports & Exports

* PDF Financial Reports
* Excel Statement Export
* Monthly Summary Reports

### Notifications

* Budget Alert Emails
* Goal Completion Notifications
* Password Reset Emails

---

## Technology Stack

### Frontend

* React.js
* React Router DOM
* Axios
* Tailwind CSS
* Recharts
* Lucide React Icons

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs
* Nodemailer
* Multer
* PDFKit
* ExcelJS

### Database

* MongoDB Atlas
* Mongoose ODM

### AI Integration

* Google Gemini API
* Custom Financial Analytics Engine

---

## System Architecture

Frontend (React + Tailwind CSS)
↓
REST API (Express.js)
↓
Authentication Layer (JWT)
↓
Business Logic Layer
↓
MongoDB Atlas Database

---

## Core Modules

### User Module

* Registration
* Login
* Profile Management
* Password Recovery

### Income Module

* Add Income
* Update Income
* Delete Income
* Income Source Analysis

### Expense Module

* Expense Tracking
* Category Management
* Budget Monitoring

### Budget Module

* Monthly Budgets
* Utilization Tracking
* Overspending Alerts

### Savings Goals Module

* Goal Creation
* Progress Tracking
* Achievement Notifications

### Analytics Module

* Financial KPIs
* Expense Distribution
* Income vs Expense Trends
* Savings Trends
* Financial Health Score

### AI Insights Module

* Spending Pattern Detection
* Personalized Recommendations
* Financial Optimization Suggestions

---

## Database Design

User
├── Income
├── Expense
├── Budget
├── Goal
└── Analytics

Collections:

* Users
* Incomes
* Expenses
* Budgets
* Goals

---

## REST API Endpoints

Authentication

* POST /api/auth/register
* POST /api/auth/login
* POST /api/auth/forgotpassword
* PUT /api/auth/resetpassword/:token

Analytics

* GET /api/analytics/dashboard
* GET /api/analytics/monthly-income-expense
* GET /api/analytics/expense-distribution
* GET /api/analytics/budget-utilization
* GET /api/analytics/savings-trend
* GET /api/analytics/income-sources
* GET /api/analytics/financial-health

Finance

* CRUD Operations for Income
* CRUD Operations for Expenses
* CRUD Operations for Budgets
* CRUD Operations for Goals

Reports

* PDF Export
* Excel Export

AI

* Financial Insights Generation

---

## Deployment

Frontend:

* Vercel

Backend:

* Render

Database:

* MongoDB Atlas

---

## Resume Description

Developed a production-ready AI-powered Personal Finance Manager using the MERN Stack. Implemented JWT authentication, budget monitoring, savings goal tracking, financial analytics dashboards, PDF/Excel report generation, and Gemini AI-driven financial recommendations. Built responsive user interfaces with React and Tailwind CSS, developed RESTful APIs using Express.js, and integrated MongoDB Atlas for scalable cloud data storage.

---

## Future Enhancements

* Investment Portfolio Tracking
* Recurring Transactions
* Net Worth Calculator
* Expense Forecasting using Machine Learning
* Multi-Currency Support
* Mobile Application (React Native)

---

