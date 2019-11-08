class AnalyzeElements {
  constructor(dom) {
    this.dom = dom;
  }

  filterElements(elements, rules) {
    if(rules && rules.length < 2) return elements;
  }
}