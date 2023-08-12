type JestAssertion = () => Promise<void> | void;

export async function repeatAssertion(fun: JestAssertion, maxTimes: number, waitSec: number, log: boolean = false) {
  let attempt = 1;

  while (attempt <= maxTimes) {
    try {
      await fun();
      if (log === true) {
        console.log(`assertion passed on attempt ${attempt + 1}`);
      }
      return;
    } catch (err) {
      if (attempt === maxTimes) {
        if (log) {
          console.log(`assertion failed on final attempt ${attempt}, no more retries`);
        }
        throw err;
      }
      if (log) {
        console.log(`assertion failed on attempt ${attempt}, retrying in ${waitSec} seconds`);
        console.log(`failed with err: ${err}`);
        await new Promise((f) => setTimeout(f, waitSec * 1000));
      }
      attempt += 1;
    }
  }
}
