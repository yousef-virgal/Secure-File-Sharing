import { FileProps } from "../FileComponent/FileComponentInterface";

export interface FileContainerInterface {
    Files: FileProps[];
    fileHanlderFunction: (id:string) => void;
}