// this is just a function that we use in our app
type Listener = (items: Project[]) => void;

enum ProjectStatus {
  Active,
  Finished,
}

// not a type or a instance because we want to intiate the class..
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
  projects: Project[] = [];
  private listeners: any[] = [];
  private static instance: ProjectState;

  private constructor() {
    // ensuring the this is singleton class
    // using private constructor...
    console.log("From the Project State Class...");
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active // here we are using an enum to create a project type...
    );
    this.projects.push(newProject);

    for (const listeners of this.listeners) {
      listeners(this.projects.slice());
    }
  }

  addListeners(listenersFn: Function) {
    this.listeners.push(listenersFn);
  }
}

const projectState = ProjectState.getInstance();

class ProjectInput {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;

    const html = document.importNode(this.templateElement.content, true);
    this.element = html.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    // selecting the elements in the this.element from the HTML
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    //
    this.attach();
    this.configure();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherInput();
    const [title, description, people] = userInput;
    console.log(title, description, people);
    // sedning data to the projectState using the addProject that exist on the instance of the project state class...
    projectState.addProject(title, description, people);
    this.clearInputs();
  }

  private gatherInput(): [string, string, number] {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // validate all inputs here
    // return the elements here.. in the tuple array structure
    return [enteredTitle, enteredDescription, +enteredPeople];
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}

class ProjectList {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLElement;
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.assignedProjects = []; // why this!!

    const html = document.importNode(this.templateElement.content, true);
    this.element = html.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListeners((projects: Project[]) => {
      // filtering the projects
      let relevantprojects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        } else {
          return project.status === ProjectStatus.Finished;
        }
      });
      this.assignedProjects = relevantprojects;
      this.rendorProjects();
    });

    this.attach();
    this.rendorContent();
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

  private rendorProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const projectItem of this.assignedProjects) {
      // benfits of the Project class is that here we get the auto completion...
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listEl?.append(listItem);
    }
  }
}

const projectInput = new ProjectInput();
const activeList = new ProjectList("active");
const finsihedList = new ProjectList("finished");

// Problems to solve...
