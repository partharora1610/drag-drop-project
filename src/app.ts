interface Draggable {
  dragStartHandler(e: DragEvent): void;
  dragEndHanlder(e: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(e: DragEvent): void;
  dropHandler(e: DragEvent): void;
  dragLeaveHandler(e: DragEvent): void;
}

type Listener = (items: Project[]) => void;

enum ProjectStatus {
  Active,
  Finished,
}

// why using a class Project and not a type...
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

class State {
  constructor() {}
}

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

  moveProject() {}

  addListeners(listenersFn: Function) {
    this.listeners.push(listenersFn);
  }
}

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

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("app", "project-list", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  dragOverHandler(e: DragEvent): void {
    if (e.dataTransfer && e.dataTransfer!.types[0] === "text/plain") {
      // read more about why e.preventDeafult here..
      e.preventDefault();
      const listId = this.element.querySelector("ul")!;
      listId.classList.add("droppable");
    }
  }

  dropHandler(e: DragEvent): void {
    const projectId = e.dataTransfer!.getData("text/plain");
    console.log(projectId);
  }

  dragLeaveHandler(_: DragEvent): void {
    const listId = this.element.querySelector("ul")!;
    listId.classList.remove("droppable");

    // get the data using the this.project.id we get from e
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler.bind(this));
    this.element.addEventListener("drop", this.dropHandler.bind(this));
    this.element.addEventListener(
      "dragleave",
      this.dragLeaveHandler.bind(this)
    );

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

    // the projects are again getting rendered multiple times??
    // solves this we were not adding the elements in the right container earlier
    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, projectItem);
    }
  }
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;
  constructor(hostId: string, project: Project) {
    super(hostId, "single-project", false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  dragStartHandler(e: DragEvent): void {
    e.dataTransfer!.setData("text/plain", this.project.id);
    e.dataTransfer!.effectAllowed = "move";
  }

  dragEndHanlder(e: DragEvent): void {
    console.log(e);
    console.log("Drag Ended..");
  }

  configure(): void {
    this.element.addEventListener(
      "dragstart",
      this.dragStartHandler.bind(this)
    );
    this.element.addEventListener("dragend", this.dragEndHanlder.bind(this));
  }

  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent =
      this.project.people.toString();
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

// intiating the classes
const projectInput = new ProjectInput();
const activeList = new ProjectList("active");
const finsihedList = new ProjectList("finished");

// What is left
// just creating a move project function and setting it up!!
