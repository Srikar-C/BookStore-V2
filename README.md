<h2><u>BOOKSTORE</u></h2>
<p> A full-stack e-commerce application designed for purchasing and managing books online. The application provides separate functionalities for customers, administrators, and superusers, with a microservices-oriented backend architecture. </p>

<p> Customers can register and securely log in, browse and search for books, manage their cart and wishlist, place orders, view order history, track orders, and manage their account details. Administrators can manage the book catalogue and inventory through an administrative dashboard, while superusers can manage administrator access and permissions. </p>
<h2><u>Application Features</u></h2>

<h3>Customer Features</h3> <ul> <li>User registration and secure login</li> <li>JWT-based authentication using HttpOnly cookies</li> <li>Browse and search books</li> <li>Filter and paginate books</li> <li>Add and remove books from the cart</li> <li>Add and remove books from the wishlist</li> <li>Update cart item quantities</li> <li>Place book orders</li> <li>View order history and order details</li> <li>Track order status</li> <li>Manage account information</li> </ul>

<h3>Admin Features</h3> <ul> <li>Admin dashboard</li> <li>View application and catalogue statistics</li> <li>Add new books</li> <li>Update existing books</li> <li>Manage book catalogue</li> <li>Manage book inventory</li> </ul>

<h3>Superuser Features</h3> <ul> <li>Manage administrator access</li> <li>Control administrator permissions</li> </ul>

<h2><u>Application Architecture</u></h2>

<p> The application follows a microservices-oriented architecture where different business functionalities are separated into independent services. This separation makes the application easier to maintain, scale, and extend as the system grows. </p>

<h2><u>Project Flow Structure</u></h2>
<pre>
BookStore V2
├── backend
│   ├── BookService
│   │   ├── .mvn
│   │   │   └── wrapper
│   │   │       └── maven-wrapper.properties
│   │   ├── src
│   │   │   ├── main
│   │   │   │   ├── java
│   │   │   │   │   └── com
│   │   │   │   │       └── bookstore
│   │   │   │   │           └── BookService
│   │   │   │   │               ├── AOP
│   │   │   │   │               │   └── LoggingAspect.java
│   │   │   │   │               ├── configuration
│   │   │   │   │               │   ├── CustomConfig.java
│   │   │   │   │               │   └── RequestIdFilter.java
│   │   │   │   │               ├── controller
│   │   │   │   │               │   ├── ArchiveController.java
│   │   │   │   │               │   └── BookController.java
│   │   │   │   │               ├── DTO
│   │   │   │   │               │   ├── request
│   │   │   │   │               │   │   ├── BookCount.java
│   │   │   │   │               │   │   ├── BookCountDTO.java
│   │   │   │   │               │   │   ├── BookDTO.java
│   │   │   │   │               │   │   ├── BookOrderCount.java
│   │   │   │   │               │   │   ├── OrderCount.java
│   │   │   │   │               │   │   ├── SingleObject.java
│   │   │   │   │               │   │   └── UserBookCount.java
│   │   │   │   │               │   └── response
│   │   │   │   │               │       ├── ResponseDTO.java
│   │   │   │   │               │       └── SubResponse.java
│   │   │   │   │               ├── model
│   │   │   │   │               │   └── Books.java
│   │   │   │   │               ├── repository
│   │   │   │   │               │   └── BookRepository.java
│   │   │   │   │               ├── service
│   │   │   │   │               │   └── BookService.java
│   │   │   │   │               ├── util
│   │   │   │   │               │   ├── Archive.java
│   │   │   │   │               │   ├── GlobalExceptionHandler.java
│   │   │   │   │               │   └── Helper.java
│   │   │   │   │               └── BookServiceApplication.java
│   │   │   │   └── resources
│   │   │   │       ├── application.properties
│   │   │   │       ├── static
│   │   │   │       └── templates
│   │   │   └── test
│   │   │       └── java
│   │   │           └── com
│   │   │               └── bookstore
│   │   │                   └── BookService
│   │   │                       └── BookServiceApplicationTests.java
│   │   ├── .gitattributes
│   │   ├── .gitignore
│   │   ├── HELP.md
│   │   ├── mvnw
│   │   ├── mvnw.cmd
│   │   └── pom.xml
│   ├── CartService
│   │   ├── Router
│   │   │   └── carts.router.js
│   │   ├── Schema
│   │   │   ├── carts.schema.js
│   │   │   └── counter.schema.js
│   │   ├── util
│   │   │   ├── auth.js
│   │   │   ├── cartUtils.js
│   │   │   ├── requestId.js
│   │   │   └── useFetch.js
│   │   ├── .gitignore
│   │   ├── package.json
│   │   └── server.js
│   ├── CommonService
│   │   ├── .mvn
│   │   │   └── wrapper
│   │   │       └── maven-wrapper.properties
│   │   ├── src
│   │   │   ├── main
│   │   │   │   ├── java
│   │   │   │   │   └── com
│   │   │   │   │       └── bookstore
│   │   │   │   │           └── CommonService
│   │   │   │   │               ├── AOP
│   │   │   │   │               │   └── LoggingAspect.java
│   │   │   │   │               ├── configuration
│   │   │   │   │               │   ├── CustomConfig.java
│   │   │   │   │               │   └── RequestIdFilter.java
│   │   │   │   │               ├── controller
│   │   │   │   │               │   └── CommonController.java
│   │   │   │   │               ├── DTO
│   │   │   │   │               │   ├── request
│   │   │   │   │               │   │   ├── SuggestionDTO.java
│   │   │   │   │               │   │   ├── UserIdOrderCountDTO.java
│   │   │   │   │               │   │   └── WishlistDTO.java
│   │   │   │   │               │   └── response
│   │   │   │   │               │       └── ResponseDTO.java
│   │   │   │   │               ├── model
│   │   │   │   │               │   ├── AccessPrivilege.java
│   │   │   │   │               │   ├── Suggestion.java
│   │   │   │   │               │   └── WishList.java
│   │   │   │   │               ├── repository
│   │   │   │   │               │   ├── AccessPrivilegeRepository.java
│   │   │   │   │               │   ├── SuggestionRepository.java
│   │   │   │   │               │   └── WishListRepository.java
│   │   │   │   │               ├── service
│   │   │   │   │               │   ├── CommonService.java
│   │   │   │   │               │   └── JWTService.java
│   │   │   │   │               ├── util
│   │   │   │   │               │   ├── Helper.java
│   │   │   │   │               │   └── UsersFeign.java
│   │   │   │   │               └── CommonServiceApplication.java
│   │   │   │   └── resources
│   │   │   │       ├── application.properties
│   │   │   │       ├── static
│   │   │   │       └── templates
│   │   │   └── test
│   │   │       └── java
│   │   │           └── com
│   │   │               └── bookstore
│   │   │                   └── CommonService
│   │   │                       └── CommonServiceApplicationTests.java
│   │   ├── .gitattributes
│   │   ├── .gitignore
│   │   ├── HELP.md
│   │   ├── mvnw
│   │   ├── mvnw.cmd
│   │   └── pom.xml
│   ├── IdentityService
│   │   ├── .mvn
│   │   │   └── wrapper
│   │   │       └── maven-wrapper.properties
│   │   ├── src
│   │   │   ├── main
│   │   │   │   ├── java
│   │   │   │   │   └── com
│   │   │   │   │       └── bookstore
│   │   │   │   │           └── IdentityService
│   │   │   │   │               ├── AOP
│   │   │   │   │               │   └── LoggingAspect.java
│   │   │   │   │               ├── configuration
│   │   │   │   │               │   ├── CustomConfig.java
│   │   │   │   │               │   ├── RequestIdFeignInterceptor.java
│   │   │   │   │               │   └── RequestIdFilter.java
│   │   │   │   │               ├── controller
│   │   │   │   │               │   ├── ArchiveController.java
│   │   │   │   │               │   ├── AuthController.java
│   │   │   │   │               │   └── UserController.java
│   │   │   │   │               ├── DTO
│   │   │   │   │               │   ├── request
│   │   │   │   │               │   │   ├── LoginDTO.java
│   │   │   │   │               │   │   ├── OTPDTO.java
│   │   │   │   │               │   │   ├── RegisterDTO.java
│   │   │   │   │               │   │   ├── ResetDTO.java
│   │   │   │   │               │   │   ├── SingleObject.java
│   │   │   │   │               │   │   └── UserIdOrderCountDTO.java
│   │   │   │   │               │   └── response
│   │   │   │   │               │       ├── ResponseDTO.java
│   │   │   │   │               │       ├── SubResponse.java
│   │   │   │   │               │       ├── UserOrderDTO.java
│   │   │   │   │               │       └── VerifyDTO.java
│   │   │   │   │               ├── model
│   │   │   │   │               │   ├── Users.java
│   │   │   │   │               │   └── VerifyUsers.java
│   │   │   │   │               ├── repository
│   │   │   │   │               │   ├── UserRepository.java
│   │   │   │   │               │   └── VerifyUserRepository.java
│   │   │   │   │               ├── service
│   │   │   │   │               │   ├── AuthService.java
│   │   │   │   │               │   ├── JWTService.java
│   │   │   │   │               │   └── UserService.java
│   │   │   │   │               ├── util
│   │   │   │   │               │   ├── Archive.java
│   │   │   │   │               │   ├── CartFeign.java
│   │   │   │   │               │   ├── CommonFeign.java
│   │   │   │   │               │   ├── GlobalExceptionHandler.java
│   │   │   │   │               │   ├── Helper.java
│   │   │   │   │               │   ├── OrderFeign.java
│   │   │   │   │               │   └── RegisterUtil.java
│   │   │   │   │               └── IdentityServiceApplication.java
│   │   │   │   └── resources
│   │   │   │       ├── application.properties
│   │   │   │       ├── static
│   │   │   │       └── templates
│   │   │   └── test
│   │   │       └── java
│   │   │           └── com
│   │   │               └── bookstore
│   │   │                   └── IdentityService
│   │   │                       └── IdentityServiceApplicationTests.java
│   │   ├── .gitattributes
│   │   ├── .gitignore
│   │   ├── HELP.md
│   │   ├── mvnw
│   │   ├── mvnw.cmd
│   │   └── pom.xml
│   ├── OrderService
│   │   ├── Router
│   │   │   └── orders.router.js
│   │   ├── scheduler
│   │   │   └── order.scheduler.js
│   │   ├── Schema
│   │   │   ├── counter.schema.js
│   │   │   └── orders.schema.js
│   │   ├── util
│   │   │   ├── auth.js
│   │   │   ├── orderUtil.js
│   │   │   ├── requestId.js
│   │   │   └── useFetch.js
│   │   ├── .gitignore
│   │   ├── package.json
│   │   └── server.js
├── frontend
│   ├── public
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── src
│   │   ├── app
│   │   │   ├── books
│   │   │   │   └── page.jsx
│   │   │   ├── bookstore
│   │   │   │   ├── [index]
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── carts
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── components
│   │   │   │   │   ├── BookCard.jsx
│   │   │   │   │   ├── OrderCard.jsx
│   │   │   │   │   ├── SettingsAside.jsx
│   │   │   │   │   ├── SideBar.jsx
│   │   │   │   │   └── TopNavBar.jsx
│   │   │   │   ├── deliveryDtls
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── help
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── modal
│   │   │   │   │   └── [index]
│   │   │   │   │       └── page.jsx
│   │   │   │   ├── orders
│   │   │   │   │   ├── [orderId]
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── settings
│   │   │   │   │   ├── components
│   │   │   │   │   │   └── OrderPieChart.jsx
│   │   │   │   │   ├── stats
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   ├── wishlist
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   ├── layout.js
│   │   │   │   │   └── page.js
│   │   │   │   ├── suggestions
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── users
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── layout.js
│   │   │   │   └── page.js
│   │   │   ├── components
│   │   │   │   ├── common
│   │   │   │   │   ├── hamburger.css
│   │   │   │   │   ├── Hamburger.jsx
│   │   │   │   │   ├── Providers.js
│   │   │   │   │   └── Theme.jsx
│   │   │   │   ├── skeletons
│   │   │   │   │   ├── AccountSkeleton.jsx
│   │   │   │   │   ├── BookSkeleton.jsx
│   │   │   │   │   ├── BookStoreSkeleton.jsx
│   │   │   │   │   ├── IdentitySkeleton.jsx
│   │   │   │   │   ├── OrderInvoiceSkeleton.jsx
│   │   │   │   │   ├── OrderSkeleton.jsx
│   │   │   │   │   ├── SettingsSkeleton.jsx
│   │   │   │   │   ├── SideNavSkeleton.jsx
│   │   │   │   │   ├── skeletonStyle.js
│   │   │   │   │   ├── TopNavSkeleton.jsx
│   │   │   │   │   └── UserSkeleton.jsx
│   │   │   │   └── utils
│   │   │   │       ├── bookUtils.js
│   │   │   │       ├── cartUtils.js
│   │   │   │       ├── commonUtils.js
│   │   │   │       ├── FunctionalUtils.js
│   │   │   │       ├── orderUtils.js
│   │   │   │       ├── showToasts.js
│   │   │   │       └── userUtils.js
│   │   │   ├── hooks
│   │   │   │   ├── AppContext.js
│   │   │   │   ├── useFetch.js
│   │   │   │   └── useStore.js
│   │   │   ├── user
│   │   │   │   ├── components
│   │   │   │   │   ├── InputBox.jsx
│   │   │   │   │   └── UserContext.jsx
│   │   │   │   ├── forgotPassword
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── login
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── register
│   │   │   │   │   ├── [admin]
│   │   │   │   │   │   └── page.jsx
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── resetPassword
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── styles
│   │   │   │   │   └── style.js
│   │   │   │   └── layout.js
│   │   │   ├── verify
│   │   │   │   ├── [token]
│   │   │   │   │   └── page.jsx
│   │   │   │   └── layout.js
│   │   │   ├── archive.js
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.js
│   │   │   ├── page.js
│   │   │   └── styles.css
│   │   ├── components
│   │   │   └── ui
│   │   │       ├── animated-theme-toggler.jsx
│   │   │       ├── button.jsx
│   │   │       ├── marquee.jsx
│   │   │       ├── meteors.jsx
│   │   │       └── noise-texture.jsx
│   │   └── lib
│   │       └── utils.js
│   ├── .gitignore
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── jsconfig.json
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.mjs
│   └── README.md
└── Readme.md
</pre>
<h2><u>Technology Stack</u></h2>
<h3>Frontend</h3> <ul> <li>Next.js</li> <li>React.js</li> <li>Tailwind CSS</li> <li>Zustand</li> <li>TanStack Query</li> <li>React Hook Form</li> </ul>

<h3>Backend</h3> <ul> <li>Java</li> <li>Spring Boot</li> <li>Node.js</li> <li>Express.js</li> <li>REST APIs</li> <li>Microservices-oriented architecture</li> </ul>
<h3>Databases</h3> <ul> <li>PostgreSQL</li> <li>MongoDB</li> </ul>

<h3>Security</h3> <ul> <li>JWT Authentication</li> <li>HttpOnly Cookies</li> <li>BCrypt Password Hashing</li> <li>Role-based Authorization</li> </ul>

<h3>Development Tools</h3> <ul> <li>Git</li> <li>GitHub</li> <li>Visual Studio Code</li> <li>Spring Tool Suite</li> </ul>
<h2>Prerequisites</h2>
Install
<a href="https://www.postgresql.org/download/" target="_blank">PostgreSQL</a>
<a href="https://nodejs.org/en" target="_blank">NodeJS</a>
<a href="https://www.mongodb.com/docs/manual/installation/" target="_blank">MongoDB</a>

<h2><u>How to run the project in your system</u></h2>
Clone the repo
  <h3>Run frontend</h3>
  <ul>
    <li>cd frontend</li>
    <li>npm install</li>
    <li>npm run dev</li>
    <li><b>Note:</b> Make sure to update environments variables to respective ports</li>
  </ul>
  <h3>Run Backend</h3>
    cd backend
    <p>Run Cart Service</p>
    <ul>
      <li>cd CartService</li>
      <li>npm install</li>
      <li>npm run dev</li>
    </ul>
    <p>Run Order Service</p>
    <ul>
      <li>cd OrderService</li>
      <li>npm install</li>
      <li>npm run dev</li>
    </ul>
    <ul> <li>Identity Service</li> <li>Book Service</li> <li>Common Service</li> </ul>
    <p> Run the above services as Spring Boot applications using your preferred IDE, such as Spring Tool Suite or IntelliJ IDEA. </p>
</h2>
<h3>Environment Configuration</h3>

<p> Before starting the application, configure the required environment variables for database connections, JWT configuration, frontend URLs, backend service URLs, and other service-specific settings. </p>

<ul> <li>PostgreSQL connection details</li> <li>MongoDB connection details</li> <li>JWT secret/configuration</li> <li>Frontend and backend service URLs</li> <li>Service-specific ports</li> </ul>

<p> <b>Note:</b> Make sure the configured ports and service URLs match the values used by the frontend and other backend services. </p>

<h3>5. Access the Application</h3>

<p> Once all services are running, open the frontend in your browser: </p>

<pre> http://localhost:3000 </pre>


