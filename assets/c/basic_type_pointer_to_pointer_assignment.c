int main() {
    int base;
    int *p = &base;
    int **pp = &p;
    int g = 10;
    int *other = &g;
    pp = &other;
}