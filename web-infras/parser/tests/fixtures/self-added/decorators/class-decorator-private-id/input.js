class A {
    #privatedecorator(value) {
      return value * 2;
    }
  
    @A.#privatedecorator
    publicMethod(value) {
      return value
    }
  }