export interface NodeData {
    id: string;
    label: string;
    type?: string;
  }
  
  export interface EdgeData {
    id: string;
    source: string;
    target: string;
    label: string;
  }
  
  export interface GraphData {
    nodes: NodeData[];
    edges: EdgeData[];
  }