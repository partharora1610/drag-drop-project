import { NamedTupleMember } from "typescript";

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

    // this is the basic validation and we can also use a interface and validate handler to validate it better
    if (
      enteredDescription.trim().length === 0 ||
      enteredTitle.trim().length == 0 ||
      enteredPeople.trim().length == 0
    ) {
      alert("Invalid input entered, please try again..");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherInput();
    console.log(userInput);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }
}

/**
 * Steps that we need to follow
 * First create a ProjectInput class
 * create a projectList class
 * third create a project state class and then use that to map it to the list that were created in the second step
 */

const projectInput = new ProjectInput();

/**
 * Steps in implementing the Project input
 *
 * Get the Elemenst : Host, element , template
 * Display it on the DOM using the
 * attach
 * configure
 * submithandler
 *
 */
