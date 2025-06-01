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
