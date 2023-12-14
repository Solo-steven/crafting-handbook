int main() {
    int base = 10;
    int other = 100;
    int *p = &base;
    *p + 10;
    *p = *p + 10;
    *p = other + *p;
    *p = &other;
}