package api

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// DB instance එක අනිත් ෆයිල්ස් වලටත් (auth.go වගේ) පාවිච්චි කරන්න පුළුවන් වෙන්න Global හදමු
var DB *mongo.Database

// 👇 ඔයාගේ ඇත්තම MongoDB Link එක මෙතන තියෙනවා
const MyMongoDBURI = "mongodb+srv://chamimusiccreation_db_user:vX9fmIxkyi1ndxg6@cluster0.clzf0n2.mongodb.net/?appName=Cluster0"

// ConnectDB කියන්නේ ඩේටාබේස් එකට කනෙක්ට් වෙන ෆන්ක්ෂන් එක
func ConnectDB() {
	// දැනටමත් කනෙක්ට් වෙලා නම් ආයේ අලුතින් කනෙක්ට් වෙන්න ඕනේ නෑ (Vercel එකේ වේගය වැඩි කරන්න මේක උදව් වෙනවා)
	if DB != nil {
		return
	}

	// තත්පර 10ක් ඇතුළත කනෙක්ට් වුණේ නැත්නම් Time out වෙනවා
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(MyMongoDBURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Println("MongoDB Connection Error in Vercel:", err)
		return
	}

	// ඇත්තටම කනෙක්ට් වුණාද කියලා හරියටම බලාගන්න Ping එකක් යවනවා
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Println("MongoDB Ping Error:", err)
		return
	}

	// 🚨 වැදගත්: ඔයාගේ Database එකේ ඇත්ත නම මෙතන "myDatabase" කියන එක වෙනුවට දාන්න
	DB = client.Database("myDatabase")
	
	fmt.Println("MongoDB Connected Successfully!")
}
