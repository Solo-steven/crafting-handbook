struct Wrapper {
    int value;
    int age;
};

struct Wrapper test() {
    struct Wrapper a;
    return a;
}

struct Wrapper with_argu(int age, int value) {
    struct Wrapper a;
    a.age = age;
    a.value = value;
    return a;
}

int main() {
    struct Wrapper a;
    a = test();
    test();
    with_argu(10, 100);
    int value = 10;
    with_argu(10, value);
    struct Wrapper b;
    b = with_argu(value, 100);
    int c = with_argu(10, value).age + 10;
    c = with_argu(c, value).value + 20;
    return 0;
}