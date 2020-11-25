function calculateBill(index1, index2) {
  let temp = index2.sort((function(a,b) {
    return (+a) - (+b);
  }));
  console.log(temp);
  let small = temp[0];
  let big = temp[index1-1];
  console.log(small, big);
  let diff = big - small;
  console.log(diff);
  return diff;
}

let arr = [10, 11, 7, 12, 14]
calculateBill(arr.length, arr);