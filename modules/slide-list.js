const slides = '~/slide-list.csv'
export default async function asyncModule() {
    try {
        
    } catch (err) {
      console.log(err);
      fs.writeFileSync("error.txt", JSON.stringify(err));
    }
  }