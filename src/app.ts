// Project State Management Class...

// this is the basic type that we wan tour functions to follow
type Listener = (items: Project[]) => void;

enum ProjectStatus {
  Active,
  Finsihed,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

class ProjectState {
  private listeners: any[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    console.log("From the Project State");
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addListener(listeneruFn: Listener) {
    this.listeners.push(listeneruFn);
  }

  addProject(title: string, description: string, people: number) {
    console.log("Add Project Running");
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );

    this.projects.push(newProject);

    // calling all the function of the this.listeners here using for of loop
    // and editing the this.projects using the listeners function here..
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }

  // some question
  // how to we call that from iside the another class
  // how to access the projects when it gets updated
  // we will create an instanceas of the project.. a global instance and helps us to get products from the class and we will use that in the app
}

const projectState = ProjectState.getInstance();

interface Validatable {
  value: string;
  required: boolean;
  max: number;
  min: number;
}

class ProjectInput {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    console.log("input element created");
    this.hostElement = document.getElementById("app") as HTMLDivElement;
    this.templateElement = document.getElementById(
      "project-input"
    ) as HTMLTemplateElement;

    const html = document.importNode(this.templateElement.content, true);
    this.element = html.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    // selecting the elements inside the element here
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.attach();
    this.configure();
  }

  private gatherInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    if (
      enteredDescription.trim().length === 0 ||
      enteredTitle.trim().length == 0 ||
      enteredPeople.trim().length == 0
    ) {
      alert("Invalid input entered, please try again..");
      return;
    } else {
      // here we are returning a string | string | number
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherInput();

    if (Array.isArray(userInput)) {
      console.log(userInput);
      const [title, desc, people] = userInput;
      projectState?.addProject(title, desc, people);
    }
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;

    this.assignedProjects = [];
    const html = document.importNode(this.templateElement.content, true);
    this.element = html.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      // get a list of projects
      this.assignedProjects = projects;
      console.log(this.assignedProjects); // this is we are checking the whether the assigned projects are updated or not..
      this.renderProjects();
    });

    this.attach();
    this.rendorContent();
  }

  private renderProjects() {
    const listElement = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    for (const projectItems of this.assignedProjects) {
      const listItem = document.createElement("li");
      listElement.textContent = projectItems.title;

      listElement?.appendChild(listItem);
    }
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  private rendorContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + "PROJECTS";
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
// const projectState = new ProjectState();

/**
 * Steps in implementing the Project input
 *
 * Get the Elemenst : Host, element , template
 * Display it on the DOM using the
 * attach
 * configure
 * submithandler
 */

/**
 * Second step is to implement a list container elemnts on the DOM
 * First select them and render them using some conditional CSS
 * DO IT
 * similar to how you implemented attach configure in the input element
 */

// Approach1
// we can add addProject method in the projectList component..

// Approach2
// we can build a class that manages the state of the app..
// and that class enables us to set up listener at different parts of the app...
