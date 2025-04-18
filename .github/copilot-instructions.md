## **🌟 General Coding Standards**

- **Maintain Clean, Modular Code**: Keep functions and components small, reusable, and well-documented.
- **Error Handling**: Always handle errors gracefully, especially in API calls.
- **Security First**: Never expose private keys, API secrets, or sensitive logic in the frontend.
- Naming Conventions: Use meaningful names, using **Camel Case naming style.**
- **Follow Existing Convetions:** This nestjs project uses a controller, services,

Most important:

- I use pnpm as my package manager always install packages with pnpm.
- Everytime you implement a new endpoint update the swagger.json (My docs to reflect the new changes, ensure it's comprehensive)
- Before attempting to install  new dependency check if it already exists in package.json

### Brief of Project:

**Med-Map** is your smart, AI-powered assistant for finding **real-time drug availability** at nearby pharmacies.

Let’s say a doctor prescribes you a drug, but you walk into three pharmacies… and none of them have it. That’s frustrating — and for some people, even dangerous.

**Med-Map solves that.** With a simple search, it shows you **which nearby pharmacies actually have the drug in stock** — along with location, price, and directions. Plus, our built-in **AI chatbot** explains what the drug does, how to use it safely, and answers any basic health questions you have.
