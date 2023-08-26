// This is listener type that is a function this allows us to add more strict checking..
type Listener = (items: Project[]) => void;

// This is enum that allows us to set the project status using the emuns
// understand that how this is working internally...
enum ProjectStatus {
  Active,
  Finished,
}

// This is a Project Class that allows us to instantiate the Project from anywhere in the apps
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// This is a abstract class that allows us to create HTML components like host , templateEl , element and then attach it to the DOM..
abstract class Component<T extends HTMLDivElement, U extends HTMLElement> {
  hostElement: T;
  templateElement: HTMLTemplateElement;
  element: U;

  constructor(
    hostId: string,
    templateId: string,
    insertAtStart: boolean,
    elementId?: string
  ) {
    this.hostElement = document.getElementById(hostId)! as T;
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;

    const importNode = document.importNode(this.templateElement.content, true);
    this.element = importNode.firstElementChild as U;

    if (elementId) {
      this.element.id = elementId;
    }
    this.attach(insertAtStart);
  }

  private attach(atStart: boolean) {
    this.hostElement.insertAdjacentElement(
      atStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// This creates a common state of the project that allows us to maintain the app data and functions in a common place..
class ProjectState {
  projects: Project[] = [];
  private listeners: any[] = [];
  private static instance: ProjectState;

  private constructor() {
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
      ProjectStatus.Active // using an enum to give the project status:=:
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

// initiating a projectState
const projectState = ProjectState.getInstance();

class ProjectInput extends Component<HTMLDivElement, HTMLElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("app", "project-input", true, "user-input");
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.configure();
    this.renderContent();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  renderContent() {
    console.log("This is a render content from ProjectInput component..");
  }

  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherInput();
    const [title, description, people] = userInput;
    console.log(title, description, people);
    projectState.addProject(title, description, people);
    this.clearInputs();
  }

  private gatherInput(): [string, string, number] {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // validate all inputs here...
    // return the elements here.. in the tuple array structure
    return [enteredTitle, enteredDescription, +enteredPeople];
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("app", "project-list", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListeners((projects: Project[]) => {
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
  }

  renderContent() {
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
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listEl?.append(listItem);
    }
  }
}

// intiating the classes
const projectInput = new ProjectInput();
const activeList = new ProjectList("active");
const finsihedList = new ProjectList("finished");
