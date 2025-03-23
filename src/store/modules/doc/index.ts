
import { defineStore } from 'pinia';
import { Doc, DocState } from './types';

const useAppStore = defineStore('doc', {
  state: (): DocState => ({ 
    docMap: new Map<number, Doc>()
  }),
  
  getters: {
    getDocMap(): Map<number, Doc>{
      return this.docMap;
    }
  },

  actions: {
    add(doc: Doc){
      this.docMap.set(doc.id, doc);  
    },
    delete(id: number){
      this.docMap.delete(id);
    },
    deleteBatch(items: any[]){
      items.forEach((e)=>{
        if(e.params && e.params.id){
          this.docMap.delete(Number(e.params.id));
        }
      });
    },
    clear() {
      this.docMap.clear();
    },
  }
});

export default useAppStore;