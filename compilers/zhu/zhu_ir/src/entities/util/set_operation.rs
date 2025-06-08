use std::{collections::HashSet, hash::Hash};

/// Intersection sets, usually used by flow equation.
/// - Time complexity: O(k*n)
///   - n: length of set
///   - k: size of the minest set.
pub fn intersection_sets<T>(sets: Vec<&HashSet<T>>) -> HashSet<T>
where
    T: Clone + Hash + Eq,
{
    if sets.is_empty() {
        return HashSet::new();
    }
    let (min_index, intersection_ref) = sets.iter().enumerate().min_by_key(|(_, set)| set.len()).unwrap();
    let other_sets = sets
        .iter()
        .enumerate()
        .filter(|(index, _)| (*index) != min_index)
        .map(|(_, set)| *set)
        .collect::<Vec<&HashSet<T>>>();
    let mut intersection = (*intersection_ref).clone();
    for other_set in other_sets {
        intersection.retain(|ele| other_set.contains(ele));
        if intersection.is_empty() {
            break;
        }
    }
    intersection
}

/// Union sets, usually used by flow equation.
/// - Time complexity: O(k*n)
///   - n: length of set
///   - k: size of the minest set.
pub fn union_sets<T>(sets: Vec<&HashSet<T>>) -> HashSet<T>
where
    T: Eq + Hash + Clone,
{
    // If there are no sets, return an empty set.
    if sets.is_empty() {
        return HashSet::new();
    }

    // 1. Start by cloning the first set (so we allocate exactly once).
    let mut result = sets[0].clone();

    // 2. For each remaining set, insert all of its elements into `result`.
    for other in &sets[1..] {
        // `extend(...)` will do a `.clone()` of each element, and insert into `result`.
        result.extend(other.iter().cloned());
    }

    result
}
