int main() {
    int base;
    int *p;
    int *pp = &base;
    p = &base;

    *p + 10;
    *p - 10;
    *p > 10;
    *p = *p + 10;
    int g = 100;
    p = &g;
}