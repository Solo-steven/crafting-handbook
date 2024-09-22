struct Test {
    int value;
    int (*getter)();
};

int mock() {
    return 100;
}

int main() {
    struct Test a;
    struct Test *pointer = &a;
    a.getter = mock;
    mock();
    a.getter();
    pointer->getter();
    return 0;
}