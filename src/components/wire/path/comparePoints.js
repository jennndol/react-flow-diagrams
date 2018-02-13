export const comparePoints = (u, v) => {
  return u.length === v.length && u.every((n, i) => arrayEquals(v[i], n));
};

function arrayEquals(u, v) {
  return u.length === v.length && u.every((n, i) => v[i] === n);
}
