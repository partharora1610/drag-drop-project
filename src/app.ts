// this is used to create a form and accept user input

// abstract class Component<T, U> {
//   hostElement: T;
//   templateElement: HTMLTemplateElement;
//   element: U;

//   constructor(
//     hostElementId: string,
//     templateId: string,
//     elementId: string
//     // elementAtStart: boolean
//   ) {
//     this.hostElement = document.getElementById(hostElementId)! as T;
//     this.templateElement = document.getElementById(
//       templateId
//     ) as HTMLTemplateElement;

//     const html = document.importNode(this.templateElement.content, true);
//     this.element = html.firstElementChild as U;
//     // this.element.id = elementId;
//   }

//   abstract attach(): void;
//   abstract configure(): void;
// }

//
class ProjectState {
  assignedProjects: any[] = [];
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
    const newProject = {
      title: title,
      description: description,
      people: people,
      id: Math.random().toString(),
    };
    this.assignedProjects.push(newProject);
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
  }

  private gatherInput(): [string, string, number] {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // validate all inputs here
    // return the elements here.. in the tuple array structure
    return [enteredTitle, enteredDescription, +enteredPeople];
  }
}

class ProjectList {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLElement;

  constructor(private type: "active" | "finished") {
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;

    const html = document.importNode(this.templateElement.content, true);
    this.element = html.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    // here we will get the projects from the projectState and then we will rendor them using loop and rendorProjects method..
    // for (const projects of assignedProjects){
    //   this.rendorProjects(projects)
    // }

    this.attach();
    this.rendorContent();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  private rendorContent() {
    const listId = `${this.type}-projects-list`;
    // adding the id to the unordered list so that we can select it later if we need it..
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + "PROJECTS";
  }

  // private rendorProjects() {}
}

const projectInput = new ProjectInput();
const activeList = new ProjectList("active");
const finsihedList = new ProjectList("finished");

// NEXT TASKS
// now we have the data state updated and now we have to send the data to the project list and render the same to the DOM
// second we need to use enums and filter the list and show the same accordingly...
// for the second task we need to write a method that renderProjects in the ProjectList class so that we render them on to the screen...
