# Inventory

A concise one-line description of the app (example): Inventory is a lightweight app to track products, stock levels, locations, and movement history for warehouses and stores.

Table of contents
- Project overview
- Features
- Technology stack
- Quick start
- Installation
- Configuration
- Usage
  - Web UI
  - REST API (examples)
  - CLI (if any)
- Data model
- Development
- Testing
- Deployment
- Troubleshooting
- Contributing
- License
- Contact

Project overview
I thought of this app while working with a client that needed to keep the changes to their mobile phones inventory. It is usful for anyone that is, at the time being, working
on what a used to.

Features
- Subscriptions tab: Registers the actual state of the user+phone+phone_number inventory
- Search and filtering: By username on users tab.
- Logs Tab: Registers all crud operations done by editors to the table. For audit use.
- Authentication and role-based access
- REST API for intergation on ./backend

Technology stack
List the actual stack used (replace placeholders):
- Backend: WAMPP or LAMPP.
- Frontend: Angular Js
- Database: sqlite3
- Authentication: JWT


Quick start (local development)
Prerequisites
- Git
- Node Js 24.15.2 or later
- Angular CLI 21.2.11



Clone the repo
git clone https://github.com/MartinTomeo/Inventory.git
cd Inventory

Using Docker (recommended)
1. Copy or create environment file:
   cp .env.example .env
   # edit .env to set DB credentials, ports, etc.

2. Start services
   docker-compose up --build

3. Run migrations and seed (if applicable)
   docker-compose exec app <migrate-command>   # e.g. npm run migrate, flask db upgrade

4. Open the app
   http://localhost:3000  # replace with actual port

Manual local setup
1. Install dependencies
   - Node: npm install
   - Python: pip install -r requirements.txt

2. Configure environment variables
   - Create .env from .env.example
   - Set DB_URL, SECRET_KEY, etc.

3. Run DB migrations
   - Example: npm run migrate / alembic upgrade head / rails db:migrate

4. Start the server
   - npm start / flask run / rails server

Configuration
- .env variables (document all expected env vars and defaults):
  - PORT=3000
  - DATABASE_URL=postgres://user:pass@localhost:5432/inventory
  - SECRET_KEY=your_secret
  - LOG_LEVEL=info
- Docker-compose services (brief description of each service)

Usage

Web UI
- How to sign up / sign in
- Basic flows: add product, receive stock, transfer stock, adjust inventory, view history
- Screenshots or GIFs (add in repo / docs/images/)

REST API
Base URL: http://localhost:3000/api/v1

Authentication
- Explain how to obtain token (login endpoint)
  POST /api/v1/auth/login
  Request:
  {
    "email": "user@example.com",
    "password": "password"
  }
  Response:
  {
    "token": "JWT-TOKEN"
  }

Example endpoints
- List products
  GET /api/v1/products
  Query params: ?q=search&page=1&per_page=50

- Get product
  GET /api/v1/products/{id}

- Create product
  POST /api/v1/products
  Body:
  {
    "sku": "ABC-123",
    "name": "Widget",
    "description": "A small widget",
    "attributes": {"color":"red"}
  }

- Get inventory for a product
  GET /api/v1/products/{id}/inventory

- Create stock movement (receive/transfer/adjustment)
  POST /api/v1/stock_movements
  Body:
  {
    "product_id": 123,
    "from_location_id": null,        # null for receive
    "to_location_id": 2,
    "quantity": 50,
    "type": "receive",               # receive|transfer|adjustment
    "reason": "Initial stock"
  }

- Example curl (replace token and base URL):
  curl -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"sku":"ABC-123","name":"Widget"}' \
       https://api.example.com/api/v1/products

Data model (overview)
- Products
  - id, sku, name, description, attributes (JSON), created_at, updated_at
- Locations
  - id, name, code, address, type (warehouse/store)
- Inventory (stock per location)
  - id, product_id, location_id, quantity, reserved_quantity
- StockMovements / Transactions (audit)
  - id, product_id, from_location_id, to_location_id, quantity, type, user_id, note, created_at
- Users & Roles
  - id, email, name, role (admin/manager/staff)

Replace with your actual schema or include a SQL/ERD export here.

Development

Run locally
- Start backend:
  npm run dev
- Start frontend:
  npm run start --prefix frontend

Linting and formatting
- Lint: npm run lint
- Format: npm run format (prettier / black)

Database migrations
- Use: npm run migrate / alembic / rails db:migrate
- Seeds: npm run seed

Environment for testing
- Use a test database and set env variable TEST_DATABASE_URL
- Run tests:
  npm test / pytest / bundle exec rspec

Testing
- Unit tests
- Integration tests
- End-to-end tests (Cypress / Playwright)
- Test coverage: (command to run and how to view report)

Deployment
- Docker image build:
  docker build -t inventory:latest .
- Recommended hosting: Docker Compose, Kubernetes, Heroku, or platform-specific instructions
- Example CI/CD (GitHub Actions):
  - On push to main: run tests, build and push Docker image, deploy to environment

Backup & restore
- Database backup
  pg_dump -Fc $DATABASE_URL > backup.dump
- Restore
  pg_restore -d $DATABASE_URL backup.dump

Troubleshooting
- Common issue: "Cannot connect to database" — check DATABASE_URL, firewall, and whether migrations ran.
- Logs:
  - docker-compose logs -f app
  - tail -f /var/log/inventory/*.log

Security
- Do not commit secrets to the repo; use environment variables or secret stores
- Rotate SECRET_KEY and DB passwords periodically
- Keep dependencies up to date and run security scans (npm audit / pip-audit)

Contributing
- How to contribute:
  1. Fork the repo
  2. Create a branch: git checkout -b feature/short-description
  3. Commit changes and push
  4. Open a pull request describing the change
- Code style: ESLint / Prettier / black rules
- Branching model: feature branches, PR reviews, approvals required

Roadmap (optional)
- Add barcode scanning support
- Multi-currency pricing for global inventories
- Advanced analytics and reporting

Changelog
- Keep a changelog at CHANGELOG.md following Keep a Changelog convention

License
- Include your license (e.g., MIT). Add LICENSE file and summary here.

Contact
- Project owner: Martin Tomeo
- Repo: https://github.com/MartinTomeo/Inventory
- Email: (replace with preferred contact)