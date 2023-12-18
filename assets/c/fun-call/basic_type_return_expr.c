
int test() {
    return 10;
}

int with_argu(int a) {
    return 10 + a;
}

int main() {
    test();
    int a = test();
    a = test() + 1;
    a = test() + test() + a;
    a = test() + a;

    with_argu(1);
    int b = with_argu(4);
    b = with_argu(a) + 10;
    b = with_argu (6) + a;
    b = with_argu(a) + with_argu(b) + 100;

    return 0;
}