require("../util/mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registrantSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: false,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  phone: {
    type: String,
    required: false,
    unique: false,
  },
  organization: {
    type: String,
    required: false,
    unique: false,
  },
  role: {
    type: String,
    required: false,
    unique: false,
  },
  notes: {
    type: String,
    required: false,
    unique: false,
  },

  winner: {
    type: String,
    required: false,
    unique: false,
  },

  entryCount: {
    type: Number,
    required: false,
    unique: false,
  },
});

//* In addition to defining the data format, we can also add methods to
//* the schema which we do below.
//*   - The .statics methods are for queries or anything operating
//*     on the collection as a whole
//*   - The .methods are for operations on an entity in the collection
//*     like the method here that fills the DB with sample data
registrantSchema.statics.populateSampleData = populateSampleData;

//* This line compiles the model and creates the Registrant class
const Registrant = mongoose.model("Registrant", registrantSchema);

async function populateSampleData() {
  const existingRegistrant = await this.findOne();
  if (null === existingRegistrant) {
    //* Nothing in the collection yet
    try {
      const adam = new Registrant({
        name: "Adam Avanian",
        email: "adam@apn.com",
        phone: "212-555-1212",
        organization: "All Points North",
        role: "Business Development Director",
        notes: "Friends with eve@goer.com",
      });
      const bridget = new Registrant({
        name: "Bridget Buddig",
        email: "bridget@apn.com",
        phone: "309-622-1513",
        organization: "All Points North",
        role: "Lead Interventionist",
      });
      const john = new Registrant({
        name: "John Hanrahan",
        email: "john@thediffs.org",
        phone: "800-MUFFLER",
        organization: "The Differents",
        role: "COO",
      });

      await Promise.all([adam.save(), bridget.save(), john.save()]);
    } catch (err) {
      console.log("DB populate failed: ", err);
    }
  }
}

module.exports = Registrant;
