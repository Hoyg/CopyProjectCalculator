# Pricing Calculator

This web application calculates pricing based on user inputs for various work items and resources.

## Features

- Calculate pricing based on the following inputs:
  - Work Items
  - Git Repositories
  - Build Pipelines
  - Release Pipelines
  - Test Plans
  - Test Suites
  - Test Cases

## Pricing Structure

- Base Cost: $1,500 (fixed for all calculations)
- Work Items Pricing Tiers:
  - $1.00 per work item for 0-5,000 items
  - $0.80 per work item for 5,001-10,000 items
  - $0.60 per work item for 10,001-15,000 items
  - $0.40 per work item for 15,001-20,000 items
  - $0.20 per work item for 20,001+ items
- Git Repositories: $2 per repository
- Build Pipelines: $5 per pipeline
- Release Pipelines: $5 per pipeline
- Test Plans, Suites, and Test Cases: Calculated using the same pricing tiers as work items

## How to Use

1. Open `index.html` in a web browser
2. Enter the quantity for each item in the corresponding input fields
3. Click "Calculate Price" to see the breakdown of costs and total price

## Technologies Used

- HTML
- CSS
- JavaScript (Vanilla JS)
